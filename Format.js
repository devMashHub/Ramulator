module.exports.Class = class Format {

   //
   //
   //
   toHex(value, digits) {
      let hex = '00000000' + value.toString(16).toUpperCase();
      return hex.slice(0-digits);
   }


   //
   //
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
