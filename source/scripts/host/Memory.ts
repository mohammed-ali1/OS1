/**
 * Created by anwar on 9/28/14.
 */

module TSOS {
    export class Memory {

        public static segment:number = -1;

        constructor(){
            this.createTable();
        }

        /**
         * Creates the Memory inside the Table
         */
        public createTable() {

            _MainMemory = new Array();
            _MainMemoryBase = new Array();

            var table = "<table>";

            for(var i=0; i<_MainMemorySize;i+=8){

                _MainMemoryBase[i] = i.toString(16).toUpperCase();
                if(i % _BlockSize == 0){
                    Memory.segment++;
                    table += "<tr><td style='font-size: 10px; font-weight: bold;'>" + "["+
                        Memory.segment + "x" + _MainMemoryBase[i] + "]" + "</td>";
                }
                else{
                    table += "<tr><td style='font-size: 10px; font-weight: bold;'>" + "["+
                        Memory.segment + "x" + _MainMemoryBase[i] + "]" + "</td>";
                }

                for(var j=i; j<=i+7;j++){
                    _MainMemory[j] = "00";
                    table += "<td>" + _MainMemory[j] + "</td>";
                }
                table += "</tr>";
            }
            table +="</table>";

            document.getElementById("table").innerHTML = table;
        }

        /**
         * Reads the Memory at the given index
         * @param index
         * @returns {string}
         */
        public read(index:number){
            return _MainMemory[index];
        }

        /**
         * Store in memory str, at address index
         * @param index
         * @param str
         */
        public store(index: number, str:string){
            _MainMemory[index] = str;
        }

        /**
         * Loads the program into the Main Memory
         */
        public loadProgram(base ,str) {

            var x = str.replace(/^\s+|\s+$/g, '');
            x = str.trim();
            var a = 0, b = 2;
            var s;
            //Need to load carefully Here!
            //base + (x.length / 2);
            for (var i = base; i < base + (x.length / 2); i++) {

                s = x.substring(a, b);
                _MainMemory[i] = s;
                a = b;
                b += 2;
            }
            for(var j = base; j<(base+_BlockSize); j++){
               s =  _MainMemory[j];
                if(s.length <= 1){
                    _MainMemory[j] = "00";
                }
            }
            this.updateMemory();
        }

        /**
         * Updates the Memory.
         */
        public updateMemory(){

            Memory.segment =  -1;

            var table = "<table>";

            for(var i=0; i<_MainMemorySize;i+=8){

                if(i % _BlockSize == 0){
                    Memory.segment++;
                    table += "<tr ><td style='font-size: 10px; font-weight: bold;'>" + "["+
                        Memory.segment + "x" + _MainMemoryBase[i] + "]" + "</td>";
                }
                else{
                    table += "<tr><td style='font-size: 10px; font-weight: bold;'>" + "["+
                        Memory.segment + "x" + _MainMemoryBase[i] + "]" + "</td>";
                }
                for(var j=i; j<=i+7;j++){
                    if(_MainMemory[j] == ""){
                        _MainMemory[j] = "00";
                    }
                    table += "<td>" + _MainMemory[j] + "</td>";
                }
                table += "</tr>";
            }
            table +="</table>";
            document.getElementById("table").innerHTML = table;
        }

        /**
         * Clears the Memory
         */
        public clearMemory(){

            for(var i=0; i<_MainMemorySize;i++){
                _MainMemory[i] = "00";
            }
            this.updateMemory();
        }

        public clearBlock(base){

            for(var i=base; i<(base+_BlockSize);i++){
                _MainMemory[i] = "00";
            }
            this.updateMemory();
        }

        /**
         * Returns the size of the Memory.
         * @returns {number}
         */
        public size(){
            return _MainMemorySize;
        }

        public copyBlock(base){
            var data: string = "";
            var current:string;
            for(var i = base; i<(base+_BlockSize);i++){
                current = _MainMemory[i];
                if(current.length ==1){
                    data += "0"+current;
                }else{
                    data += current;
                }
            }
            this.updateMemory();
            return data;
        }
    }
}