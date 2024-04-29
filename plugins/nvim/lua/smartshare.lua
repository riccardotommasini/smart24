local M = {}
local ignore = nil
local ns = vim.api.nvim_create_namespace('smartshare')

local function get_line_column_from_byte_offset(byte_offset)
    local line = vim.fn.byte2line(byte_offset)
    local line_start = vim.fn.line2byte(line)
    local col = byte_offset - line_start + 1
    return line - 1, col
end

function M.insert_received_text(offset, text)
    local start_row, start_col = get_line_column_from_byte_offset(offset)
    vim.api.nvim_buf_set_text(0, start_row, start_col, start_row, start_col, text)
end

function M.delete_text(offset, deleted)
    local start_row, start_col = get_line_column_from_byte_offset(offset)
    local end_row, end_col = get_line_column_from_byte_offset(offset + deleted)
    vim.api.nvim_buf_set_text(0, start_row, start_col, end_row, end_col, {})
end

local handle = vim.fn.jobstart("./test", {
    on_stdout = function(_job_id, data, event)
        for _,json_object in ipairs(data) do
            print(json_object)
            local change = vim.json.decode(json_object)

            if change.action == "text_update" and change.update_type == "insert" then
                M.insert_received_text(change.offset, change.text)
            elseif change.action == "text_update" and change.update_type == "delete" then
                M.delete_text(change.offset, change.deleted)
            end
        end
    end,
    on_stderr = function(_job_id, data, event)
        print(vim.inspect(data))
    end
})


vim.api.nvim_buf_attach(0, false, {
    on_bytes = function(
        _,
        buf,
        changedtick,
        startrow,
        startcolumn,
        byte_offset,
        old_row,
        old_column,
        old_byte_len,
        new_row,
        new_column,
        new_byte_len
    )
        if ignore ~= nil and ignore.row == startrow and ignore.col == startcolumn then
            ignore = nil
            return
        end

        local extmark_opts =
        { priority = 10, end_col = 6, hl_group = "TermCursor" }

        vim.api.nvim_buf_set_extmark(0, ns, 1, 5, extmark_opts)

        if new_row > old_row or (new_row == old_row and new_column >= old_column) then
            local column_end;
            if new_row == 0 then
                column_end = startcolumn + new_column
            else
                column_end = new_column
            end
            local message = {
                action = "text_update",
                update_type = "insert",
                offset = byte_offset,
                text = vim.api.nvim_buf_get_text(buf, startrow, startcolumn, startrow + new_row, column_end, {})
            }

            local json = vim.fn.json_encode(message)
            print(json)
            --[[
            vim.fn.chansend(handle, string.len(json) .. "\n")
            vim.fn.chansend(handle, json .. "\n")
            ]]
        else
            local message = {
                action = "text_update",
                update_type = "delete",
                offset = byte_offset,
                deleted = old_byte_len - new_byte_len
            }

            local json = vim.fn.json_encode(message)
            print(json)
            --[[
            vim.fn.chansend(handle, string.len(json) .. "\n")
            vim.fn.chansend(handle, json .. "\n")
            ]]
        end
    end
})

return M
