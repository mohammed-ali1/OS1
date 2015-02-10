/**
* Created by anwar on 11/29/14.
*/
var TSOS;
(function (TSOS) {
    var File = (function () {
        function File(filename, filecontents) {
            this.filename = filename;
            this.filecontents = filecontents;
            this.fileName = filename;
            this.fileContents = filecontents;
        }
        return File;
    })();
    TSOS.File = File;
})(TSOS || (TSOS = {}));
