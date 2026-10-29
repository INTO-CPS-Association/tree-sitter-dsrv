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
  constructor: ["List" "Map" "Expr"] @type.builtin)

(struct_type
  "Struct" @type.builtin)

(union_type
  "Union" @type.builtin)

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
  "language"
  "use"
  "mod"
  "type"
  "def"
  "const"
  "match"
  "matches"
  "as"
  "not"
  "and"
  "or"
] @keyword

(visibility_modifier) @keyword

[
  "&&"
  "||"
  "!"
  "=>"
  "=="
  "!="
  "**"
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
  "|"
  "@"
  ".."
  "..="
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

(rest_pattern) @punctuation.delimiter

[
  ","
  ":"
  "."
  "::"
] @punctuation.delimiter

((identifier) @type.builtin
  (#match? @type.builtin "^(Int|Float|Bool|Str|Unit|Any)$"))

((identifier) @keyword
  (#match? @keyword "^(dynamic|eval|defer)$"))

((identifier) @function.builtin
  (#match? @function.builtin "^(update|default|is_defined|when|latch|init|fix|partial|sin|cos|tan|abs|trunc|floor|ceil|round|monitored_at|dist)$"))

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

((call_expression
  function: (identifier) @function)
  (#not-match? @function "^[A-Z]"))

(call_expression
  function: (member_expression
    property: (identifier) @function.method))

(member_expression
  property: (identifier) @property)

(call_expression
  function: (identifier) @function.builtin
  (#match? @function.builtin "^(List|Tuple|Map|Struct)$"))

; Definitions

(type_alias
  name: (identifier) @type)

(type_parameters
  (identifier) @type)

(named_type
  name: (identifier) @type)

(named_type
  name: (scoped_identifier
    name: (identifier) @type))

(named_type_reference
  (identifier) @type)

(named_type_reference
  (scoped_identifier
    name: (identifier) @type))

(union_alternative
  tag: (identifier) @constructor)

(function_definition
  name: (identifier) @function)

(parameter
  name: (identifier) @variable.parameter)

(const_declaration
  name: (identifier) @constant)

(struct_field_type
  name: (identifier) @property)

; Tagged-union constructors are capitalised; a capitalised name applied to a
; payload is a constructor, never a call.

((call_expression
  function: (identifier) @constructor)
  (#match? @constructor "^[A-Z]")
  (#not-match? @constructor "^(List|Tuple|Map|Struct)$"))

(call_expression
  function: (scoped_identifier
    name: (identifier) @constructor))

((expression
  (identifier) @constructor)
  (#match? @constructor "^[A-Z]"))

((expression
  (scoped_identifier
    name: (identifier) @constructor))
  (#match? @constructor "^[A-Z]"))

; Patterns

(tag_pattern
  tag: (identifier) @constructor)

((match_arm
  pattern: (identifier) @constructor)
  (#match? @constructor "^[A-Z]"))

((or_pattern
  (identifier) @constructor)
  (#match? @constructor "^[A-Z]"))

((matches_expression
  pattern: (identifier) @constructor)
  (#match? @constructor "^[A-Z]"))

((match_arm
  pattern: (identifier) @variable)
  (#match? @variable "^[a-z_]"))

(as_pattern
  name: (identifier) @variable)

(struct_pattern_field
  name: (identifier) @property)
