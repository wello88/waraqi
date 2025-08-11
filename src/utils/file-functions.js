import fs from 'fs';
import path from 'path';

export const deleteFile = (filePath) => {
    if (!filePath) return; // Prevent error if filePath is undefined
    fs.unlink(path.resolve(filePath), (err) => {
        if (err) {
            // Optionally log error
        }
    });
};