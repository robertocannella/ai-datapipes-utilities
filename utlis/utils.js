
export class Utils {
    // get a timestamp for comparing
    static getDaysAgo(date, days) {
        var pastDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - days);
        return pastDate;
    }
    static ensureDirectoryExistence(filePath) {
        var dirname = path.dirname(filePath);
        if (fs.existsSync(dirname)) {
            return true;
        }
        ensureDirectoryExistence(dirname);
        fs.mkdirSync(dirname);
    }

}
