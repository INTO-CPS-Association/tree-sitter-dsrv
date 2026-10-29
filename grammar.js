const PREC = {
  if: 1,
  concat: 2,
  implication: 3,
  or: 4,
  and: 5,
  equality: 6,
  comparison: 7,
  additive: 8,
  multiplicative: 9,
  cast: 10,
  unary: 11,
  power: 12,
  member: 13,
  call: 14,
};

const commaSep = rule => optional(commaSep1(rule));

const commaSep1 = rule => seq(rule, repeat(seq(",", rule)), optional(","));

module.exports = grammar({
  name: "dsrv",

  extras: $ => [
    /\s/,
    $.line_comment,
    $.block_comment,
  ],

  word: $ => $.identifier,

  rules: {
    source_file: $ => repeat($._statement),

    _statement: $ => choice(
      $.language_declaration,
      $.use_declaration,
      $.mod_declaration,
      $.type_alias,
      $.function_definition,
      $.const_declaration,
      $.declaration,
      $.assignment,
      $.expression,
    ),

    // Module headers

    language_declaration: $ => seq(
      "language",
      field("name", $.identifier),
    ),

    use_declaration: $ => seq(
      "use",
      field("tree", $._use_tree),
    ),

    _use_tree: $ => choice(
      $.identifier,
      $.scoped_identifier,
      $.use_wildcard,
      $.scoped_use_list,
    ),

    use_wildcard: $ => seq(
      field("path", $._path),
      "::",
      "*",
    ),

    scoped_use_list: $ => seq(
      field("path", $._path),
      "::",
      field("list", $.use_list),
    ),

    use_list: $ => seq(
      "{",
      commaSep($._use_tree),
      "}",
    ),

    mod_declaration: $ => seq(
      "mod",
      field("path", $._path),
    ),

    _path: $ => choice(
      $.identifier,
      $.scoped_identifier,
    ),

    scoped_identifier: $ => seq(
      field("path", $._path),
      "::",
      field("name", $.identifier),
    ),

    // Definitions

    visibility_modifier: _ => "internal",

    type_alias: $ => seq(
      optional($.visibility_modifier),
      "type",
      field("name", $.identifier),
      optional(field("type_parameters", $.type_parameters)),
      "=",
      field("type", $._type),
    ),

    type_parameters: $ => seq(
      "<",
      commaSep($.identifier),
      ">",
    ),

    function_definition: $ => seq(
      optional($.visibility_modifier),
      "def",
      field("name", $.identifier),
      optional(field("type_parameters", $.type_parameters)),
      field("parameters", $.parameters),
      "->",
      field("return_type", $._type),
      "=",
      field("body", $.expression),
    ),

    parameters: $ => seq(
      "(",
      commaSep($.parameter),
      ")",
    ),

    parameter: $ => seq(
      field("name", $.identifier),
      ":",
      field("type", $._type),
    ),

    const_declaration: $ => seq(
      optional($.visibility_modifier),
      "const",
      field("name", $.identifier),
      ":",
      field("type", $._type),
      "=",
      field("value", $.expression),
    ),

    declaration: $ => seq(
      field("kind", choice("in", "out", "aux", "var")),
      field("name", $.identifier),
      optional($.type_annotation),
      optional(seq("=", field("value", $.expression))),
    ),

    type_annotation: $ => seq(
      ":",
      field("type", $._type),
    ),

    // Types

    _type: $ => choice(
      $.struct_type,
      $.union_type,
      $.generic_type,
      $.named_type,
      $.tuple_type,
      $.function_type,
      $.builtin_type,
    ),

    struct_type: $ => seq(
      "Struct",
      "<",
      optional(choice(
        seq($.ellipsis, optional(",")),
        seq(
          $.struct_field_type,
          repeat(seq(",", $.struct_field_type)),
          optional(seq(",", $.ellipsis)),
          optional(","),
        ),
      )),
      ">",
    ),

    struct_field_type: $ => seq(
      field("name", choice($.identifier, $.string)),
      ":",
      field("type", $._type),
    ),

    union_type: $ => seq(
      "Union",
      "<",
      commaSep($.union_alternative),
      ">",
    ),

    union_alternative: $ => seq(
      field("tag", $.identifier),
      optional(seq(":", field("payload", $._type))),
    ),

    generic_type: $ => seq(
      field("constructor", choice("List", "Map", "Expr")),
      "<",
      field("argument", $._type),
      optional(","),
      ">",
    ),

    named_type: $ => seq(
      field("name", $._path),
      optional(field("arguments", $.type_arguments)),
    ),

    type_arguments: $ => seq(
      "<",
      commaSep($._type),
      ">",
    ),

    tuple_type: $ => choice(
      seq(
        "(",
        field("element", $._type),
        ",",
        ")",
      ),
      seq(
        "(",
        field("element", $._type),
        ",",
        field("element", $._type),
        repeat(seq(",", field("element", $._type))),
        optional(","),
        ")",
      ),
    ),

    function_type: $ => seq(
      "(",
      field("parameter", $._type),
      "->",
      field("return", $._type),
      ")",
    ),

    // Statements and expressions

    assignment: $ => seq(
      field("left", $.identifier),
      "=",
      field("right", $.expression),
    ),

    expression: $ => choice(
      $.if_expression,
      $.lambda_expression,
      $.binary_expression,
      $.unary_expression,
      $.cast_expression,
      $.dynamic_expression,
      $.match_expression,
      $.matches_expression,
      $.call_expression,
      $.index_expression,
      $.member_expression,
      $.parenthesized_expression,
      $.object_literal,
      $.list_literal,
      $.scoped_identifier,
      $.identifier,
      $.boolean,
      $.number,
      $.string,
      $.unit,
    ),

    if_expression: $ => prec.right(PREC.if, seq(
      "if",
      field("condition", $.expression),
      "then",
      field("consequence", $.expression),
      "else",
      field("alternative", $.expression),
    )),

    binary_expression: $ => choice(
      prec.left(PREC.concat, seq(
        field("left", $.expression),
        "++",
        field("right", $.expression),
      )),
      prec.left(PREC.implication, seq(
        field("left", $.expression),
        "=>",
        field("right", $.expression),
      )),
      prec.left(PREC.or, seq(
        field("left", $.expression),
        choice("||", "or"),
        field("right", $.expression),
      )),
      prec.left(PREC.and, seq(
        field("left", $.expression),
        choice("&&", "and"),
        field("right", $.expression),
      )),
      prec.left(PREC.equality, seq(
        field("left", $.expression),
        choice("==", "!="),
        field("right", $.expression),
      )),
      prec.left(PREC.comparison, seq(
        field("left", $.expression),
        choice("<=", ">=", "<", ">"),
        field("right", $.expression),
      )),
      prec.left(PREC.additive, seq(
        field("left", $.expression),
        choice("+", "-"),
        field("right", $.expression),
      )),
      prec.left(PREC.multiplicative, seq(
        field("left", $.expression),
        choice("*", "/", "%"),
        field("right", $.expression),
      )),
      prec.right(PREC.power, seq(
        field("left", $.expression),
        "**",
        field("right", $.expression),
      )),
    ),

    unary_expression: $ => prec(PREC.unary, seq(
      field("operator", choice("!", "-", "not")),
      field("argument", $.expression),
    )),

    // Only a scalar type or a type name can be the target of a cast, so
    // `x as T < y` stays a comparison.
    cast_expression: $ => prec.left(PREC.cast, seq(
      field("value", $.expression),
      "as",
      field("type", choice($.builtin_type, $.named_type_reference)),
    )),

    named_type_reference: $ => $._path,

    lambda_expression: $ => prec.right(seq(
      "\\",
      field("parameters", $.lambda_parameters),
      "->",
      field("body", $.expression),
    )),

    lambda_parameters: $ => seq(
      $.lambda_parameter,
      repeat(seq(",", $.lambda_parameter)),
    ),

    lambda_parameter: $ => seq(
      field("name", $.identifier),
      optional(seq(":", field("type", $._type))),
    ),

    dynamic_expression: $ => prec(PREC.call, seq(
      field("kind", choice("dynamic", "eval", "defer")),
      "(",
      field("source", $.expression),
      optional(field("type", $.type_annotation)),
      optional(seq(",", field("scope", $.variable_set))),
      optional(","),
      ")",
    )),

    variable_set: $ => seq(
      "{",
      commaSep($.identifier),
      "}",
    ),

    match_expression: $ => seq(
      "match",
      "(",
      field("value", $.expression),
      optional(","),
      ")",
      "{",
      commaSep($.match_arm),
      "}",
    ),

    match_arm: $ => seq(
      field("pattern", $._pattern),
      optional(seq("if", field("guard", $.expression))),
      "->",
      field("body", $.expression),
    ),

    matches_expression: $ => seq(
      "matches",
      "(",
      field("value", $.expression),
      ",",
      field("pattern", $._pattern),
      optional(seq("if", field("guard", $.expression))),
      optional(","),
      ")",
    ),

    call_expression: $ => prec.left(PREC.call, seq(
      field("function", choice(
        $.identifier,
        $.scoped_identifier,
        $.member_expression,
        $.parenthesized_expression,
        $.lambda_expression,
        $.dynamic_expression,
        $.match_expression,
        $.matches_expression,
        $.call_expression,
        $.index_expression,
        $.list_literal,
        $.object_literal,
        $.number,
        $.string,
        $.boolean,
        $.unit,
      )),
      "(",
      optional(seq(
        field("argument", $._call_argument),
        repeat(seq(",", field("argument", $._call_argument))),
        optional(","),
      )),
      ")",
    )),

    _call_argument: $ => choice(
      $.map_entry,
      $.expression,
    ),

    index_expression: $ => prec.left(PREC.member, seq(
      field("value", $.expression),
      "[",
      field("index", choice($.integer, $.identifier, $.scoped_identifier)),
      "]",
    )),

    member_expression: $ => prec.left(PREC.member, seq(
      field("object", $.expression),
      ".",
      field("property", choice($.identifier, $.integer)),
    )),

    parenthesized_expression: $ => seq(
      "(",
      $.expression,
      ")",
    ),

    list_literal: $ => seq(
      "[",
      commaSep($.expression),
      "]",
    ),

    object_literal: $ => seq(
      "{",
      commaSep($.object_entry),
      "}",
    ),

    // `{ a }` is shorthand for `{ a: a }`.
    object_entry: $ => choice(
      seq(
        field("key", choice($.identifier, $.string)),
        ":",
        field("value", $.expression),
      ),
      field("key", $.identifier),
    ),

    map_entry: $ => seq(
      field("key", $.string),
      ":",
      field("value", $.expression),
    ),

    // Patterns

    _pattern: $ => choice(
      $.or_pattern,
      $._pattern_primary,
    ),

    or_pattern: $ => prec.left(seq(
      $._pattern,
      "|",
      $._pattern,
    )),

    _pattern_primary: $ => choice(
      $.identifier,
      $.as_pattern,
      $.tag_pattern,
      $.tuple_pattern,
      $.list_pattern,
      $.struct_pattern,
      $.range_pattern,
      $.pattern_integer,
      $.string,
      $.boolean,
      $.unit,
    ),

    as_pattern: $ => seq(
      field("name", $.identifier),
      "@",
      field("pattern", $._pattern_primary),
    ),

    tag_pattern: $ => seq(
      field("tag", $.identifier),
      "(",
      field("payload", $._pattern),
      optional(","),
      ")",
    ),

    tuple_pattern: $ => seq(
      "(",
      repeat1(seq($._pattern, ",")),
      optional($._pattern),
      ")",
    ),

    list_pattern: $ => seq(
      "[",
      commaSep($._pattern),
      "]",
    ),

    struct_pattern: $ => seq(
      "{",
      optional(choice(
        seq($.rest_pattern, optional(",")),
        seq(
          $.struct_pattern_field,
          repeat(seq(",", $.struct_pattern_field)),
          optional(seq(",", $.rest_pattern)),
          optional(","),
        ),
      )),
      "}",
    ),

    struct_pattern_field: $ => choice(
      seq(
        field("name", $.identifier),
        ":",
        field("pattern", $._pattern),
      ),
      field("name", $.identifier),
    ),

    rest_pattern: _ => "..",

    range_pattern: $ => seq(
      field("start", $.pattern_integer),
      choice("..", "..="),
      field("end", $.pattern_integer),
    ),

    pattern_integer: $ => seq(
      optional("-"),
      $.integer,
    ),

    // Tokens

    ellipsis: _ => "...",

    boolean: _ => choice("true", "false"),

    unit: $ => seq("(", ")"),

    builtin_type: _ => choice(
      "Int",
      "Float",
      "Bool",
      "Str",
      "Unit",
      "Any",
    ),

    // A float names its fraction (`1.0`, not `1.`), so `1..5` is a range.
    number: _ => token(choice(
      /[0-9]+\.[0-9]+(?:[eE][+-]?[0-9]+)?/,
      /[0-9]+[eE][+-]?[0-9]+/,
      /[0-9]+/,
    )),

    integer: _ => token(/[0-9]+/),

    string: _ => token(/"[^"\\\n\r]*(?:\\[tn'"\\][^"\\\n\r]*)*"/),

    identifier: _ => /[A-Za-z_][A-Za-z0-9_]*/,

    line_comment: _ => token(seq("//", /.*/)),

    block_comment: _ => token(/\(\*[^*]*\*+(?:[^\)*][^*]*\*+)*\)/),
  },
});
