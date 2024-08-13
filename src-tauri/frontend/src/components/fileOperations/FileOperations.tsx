"use client";

import React, { useState } from 'react';
import FileRenamer from './FileRenamer';

export default function FileOperations() {
    const [selectedOperation, setSelectedOperation] = useState<string>('fileRenamer');

    const renderOperationComponent = () => {
        switch (selectedOperation) {
            case 'fileRenamer':
                return <FileRenamer />;
            // Add more cases here for other operations
            default:
                return null;
        }
    };

    return (
        <div className="w-full h-full flex flex-col bg-white">
            <h1 className="flex text-xl font-bold bg-gray-300 pl-2 py-2">Aktion</h1>
            <div className="p-2 py-4">
                <label htmlFor="operation-select" className="mr-2">Werkzeug:</label>
                <select
                    id="operation-select"
                    value={selectedOperation}
                    onChange={(e) => setSelectedOperation(e.target.value)}
                    className="border rounded px-2 py-1"
                >
                    <option value="fileRenamer">Titel umbenennen</option>
                    
                </select>
            </div>
            <div className="px-2">
                {renderOperationComponent()}
            </div>
        </div>
    );
}
