/**
* Created by anwar on 10/29/14.
*/
var TSOS;
(function (TSOS) {
    var List = (function () {
        function List() {
            this.index = 0;
            this.size = 0;
        }
        return List;
    })();
    TSOS.List = List;
})(TSOS || (TSOS = {}));
