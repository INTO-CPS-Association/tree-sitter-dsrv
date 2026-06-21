(line_comment) @comment

(string) @string
(number) @number
(boolean) @boolean
(builtin_type) @type.builtin

[
  "in"
  "out"
  "aux"
  "var"
  "if"
  "then"
  "else"
] @keyword

[
  "&&"
  "||"
  "!"
  "=>"
  "=="
  "<="
  ">="
  "<"
  ">"
  "+"
  "-"
  "*"
  "/"
  "%"
  "="
  "++"
] @operator

[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
  "<"
  ">"
] @punctuation.bracket

[
  ","
  ":"
  "."
] @punctuation.delimiter

((identifier) @type.builtin
  (#match? @type.builtin "^(Int|Float|Bool|Str|Unit|List|Map|Struct)$"))

((identifier) @keyword
  (#match? @keyword "^(dynamic|defer)$"))

((identifier) @function.builtin
  (#match? @function.builtin "^(eval|update|default|is_defined|when|latch|init|monitored_at|dist|sin|cos|tan|abs)$"))

(declaration
  name: (identifier) @variable)

(assignment
  left: (identifier) @variable)

(call_expression
  function: (identifier) @function)

(call_expression
  function: (member_expression
    property: (identifier) @function.method))

(member_expression
  property: (identifier) @property)
