86
84
82
80
77
76
74
71
70
68
66
64
62
60
58
56
54
52
50
48
46 
44
42
40
38
33
32
31
30
28
local e = {}
local ignore = nil

vim.api.nvim_buf_attach(0, false, {
    on_bytes = function(
        _,
        buf,
        changedtick,
        startrow,
        startcolumn,
        byte_offset,
        old__row,
        old__column,
        old_byte_len,
        new__row,
        new__column,
        new_byte_length
    ) 

        if ignore ~= nil  and ignore.row == startrow and ignore.col == startcolumn then
            ignore = nil
            return 
        end
        
        

        vim.schedule(function()  
            ignore = {
                row = 0,
                col = 0
            }
            vim.api.nvim_buf_set_text(buf, 0, 0, 0, 0, {"" .. changedtick, ""}) 
        end
        )
    
    end
hello
    

})



