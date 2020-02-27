// Pinput format grammar
// =====================
//
// Accepts expressions like "{h} {c}-{d}{d}" and returns a parsed javascript object:
// [
//     { type: "field", field: "hex" },
//     { type: "divider", symbol: " " },
//     { type: "field", field: "alpha" },
//     { type: "divider", symbol: "-" },
//     { type: "field", field: "num" },
//     { type: "field", field: "num" }
// ]

{
  function mapFieldType(type) {
    var types = {
      h: 'hex',
      d: 'num',
      c: 'alpha',
      v: 'custom'
    };
    return types[type];
  }
}

start
  = Group
  
Group
  = head:Field div:Divider tail:Group {
    return [head, div].concat(tail)
  }
  / head:Field tail:Group {
    return [head].concat(tail)
  }
  / head:Field { return [head]; }

Field
  = "{" _ type:FieldType _ "}" { return type; }

FieldType
  = char:[dhcv] { return { type: "field", field: mapFieldType(char) }; }
  
Divider "divider"
  = div:[ -] { return { type: "divider", symbol: div }; }
  
_ "whitespace"
  = [ \t\n\r]*