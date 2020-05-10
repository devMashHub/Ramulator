module.exports.Class = class Format {

   //
   // toBin
   //
   toBin(value, digits) {
      let bin = '0000000000000000' + (value >>> 0).toString(2);
      //let binString = hex.slice(0 - digits);
      let binString = bin.slice(0 - digits).replace(/\B(?=(\d{8})+(?!\d))/g, " ");
      return binString;
   }


   //
   // toHex
   //
   toHex(value, digits) {
      let hex = '0000000000000000' + value.toString(16).toUpperCase();
      let hexString = hex.slice(0 - digits);
      return hexString;
   }


   //
   // toUnicode
   //
   toUnicode(theString) {

      var unicodeString = '';

      for (var i=0; i < theString.length; i++) {

         var theUnicode = theString.charCodeAt(i).toString(16).toUpperCase();

         while (theUnicode.length < 4) {
            theUnicode = '0' + theUnicode;
         }

         theUnicode = '\\u' + theUnicode;
         unicodeString += theUnicode;

      }

      return unicodeString;

   }


   //
   //
   //
   toVisibleChar(value) {

      let result = '.';
      let v = value & 0x7F;
      if (v > 31) {
         result = String.fromCharCode(value);
      }
      return result;

   }

}
