local M = {}
local ns = vim.api.nvim_create_namespace('smartshare')
local is_user_input = true

function M.get_line_column_from_byte_offset(byte_offset)
    local line = vim.fn.byte2line(byte_offset + 1) - 1
    if line < 0 then
        return 0, 0
    end
    local line_start = vim.api.nvim_buf_get_offset(0, line)
    local col = byte_offset - line_start
    return line, col
end

function M.set_text(offset, deleted, text)
    local start_row, start_col = M.get_line_column_from_byte_offset(offset)
    local end_row, end_col = M.get_line_column_from_byte_offset(offset + deleted)
    vim.api.nvim_buf_set_text(0, start_row, start_col, end_row, end_col, text)
end

local handle = vim.fn.jobstart("./client 127.0.0.1:4903", {
    on_stdout = function(_job_id, data, event)
        for _, json_object in ipairs(data) do
            if json_object ~= nil and json_object ~= '' then
                local change = vim.json.decode(json_object)

                if change.action == "i_d_e_update" and change.update_type == "TextModification" then
                    is_user_input = false

                    M.set_text(change.offset, change.delete, vim.fn.split(change.text, "\n", 1))
                end
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
        --[[
        local extmark_opts =
        { priority = 10, end_col = 6, hl_group = "TermCursor" }

        vim.api.nvim_buf_set_extmark(buf, ns, 1, 5, extmark_opts)
        ]]

        if is_user_input == false then
            is_user_input = true
            return
        end

        if new_row > old_row or (new_row == old_row and new_column >= old_column) then
            local column_end
            if new_row == 0 then
                column_end = startcolumn + new_column
            else
                column_end = new_column
            end

            local row_end = startrow + new_row
            local max_line = math.max(0, vim.api.nvim_buf_line_count(buf) - 1)

            if row_end > max_line then
                byte_offset = byte_offset - 1
                startrow, startcolumn = M.get_line_column_from_byte_offset(byte_offset)
                local new_byte_offset = byte_offset + new_byte_len
                row_end, column_end = M.get_line_column_from_byte_offset(new_byte_offset)
            end

            local replaced = 0
            if old_byte_len == new_byte_len then
                replaced = old_byte_len
            end

            local message = {
                action = "i_d_e_update",
                offset = byte_offset,
                delete = replaced,
                text = table.concat(vim.api.nvim_buf_get_text(buf, startrow, startcolumn, row_end, column_end, {}), '\n')
            }

            local json = vim.json.encode(message)
            vim.fn.chansend(handle, json .. "\n")
        else
            local message = {
                action = "i_d_e_update",
                offset = byte_offset,
                delete = old_byte_len - new_byte_len,
                text = ""
            }

            local json = vim.json.encode(message)
            vim.fn.chansend(handle, json .. "\n")
        end
    end
})

return M
