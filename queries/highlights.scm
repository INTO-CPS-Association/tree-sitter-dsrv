[
  (line_comment)
  (block_comment)
] @comment

(string) @string
[
  (number)
  (integer)
] @number
(boolean) @boolean
(builtin_type) @type.builtin

(generic_type
  constructor: ["List" "Map"] @type.builtin)

(struct_type
  "Struct" @type.builtin)

(dynamic_expression
  kind: ["dynamic" "eval" "defer"] @function.builtin)

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
  "->"
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

(ellipsis) @punctuation.delimiter

[
  ","
  ":"
  "."
] @punctuation.delimiter

((identifier) @type.builtin
  (#match? @type.builtin "^(Int|Float|Bool|Str|Unit|Any)$"))

((identifier) @keyword
  (#match? @keyword "^(dynamic|eval|defer)$"))

((identifier) @function.builtin
  (#match? @function.builtin "^(update|default|is_defined|when|latch|init|fix|partial|sin|cos|tan|abs|monitored_at|dist)$"))

(declaration
  name: (identifier) @variable)

(assignment
  left: (identifier) @variable)

(variable_set
  (identifier) @variable)

(lambda_parameter
  name: (identifier) @variable.parameter)

(object_entry
  key: (identifier) @property)

(call_expression
  function: (identifier) @function)

(call_expression
  function: (member_expression
    property: (identifier) @function.method))

(member_expression
  property: (identifier) @property)

(call_expression
  function: (identifier) @function.builtin
  (#match? @function.builtin "^(List|Tuple|Map|Struct)$"))
