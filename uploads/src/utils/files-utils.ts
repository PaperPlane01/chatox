import fileSystem from "fs";

export const copyFile = (source: string, destination: string): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
        fileSystem.copyFile(source, destination, error => {
            if (error) {
                reject(error);
            }

            resolve();
        })
    })
};
