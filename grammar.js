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
  unary: 10,
  member: 11,
  call: 12,
};

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
      $.declaration,
      $.assignment,
      $.expression,
    ),

    declaration: $ => seq(
      field("kind", choice("in", "out", "aux", "var")),
      field("name", $.identifier),
      optional($.type_annotation),
    ),

    type_annotation: $ => seq(
      ":",
      field("type", $._type),
    ),

    _type: $ => choice(
      $.struct_type,
      $.generic_type,
      $.tuple_type,
      $.function_type,
      $.builtin_type,
    ),

    struct_type: $ => seq(
      "Struct",
      "<",
      optional(choice(
        $.ellipsis,
        seq(
          $.struct_field_type,
          repeat(seq(",", $.struct_field_type)),
          optional(seq(",", $.ellipsis)),
        ),
      )),
      ">",
    ),

    struct_field_type: $ => seq(
      field("name", $.identifier),
      ":",
      field("type", $._type),
    ),

    generic_type: $ => seq(
      field("constructor", choice("List", "Map")),
      "<",
      field("argument", $._type),
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
      $.dynamic_expression,
      $.call_expression,
      $.index_expression,
      $.member_expression,
      $.parenthesized_expression,
      $.object_literal,
      $.list_literal,
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
      prec.right(PREC.implication, seq(
        field("left", $.expression),
        "=>",
        field("right", $.expression),
      )),
      prec.left(PREC.or, seq(
        field("left", $.expression),
        "||",
        field("right", $.expression),
      )),
      prec.left(PREC.and, seq(
        field("left", $.expression),
        "&&",
        field("right", $.expression),
      )),
      prec.left(PREC.equality, seq(
        field("left", $.expression),
        "==",
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
    ),

    unary_expression: $ => prec(PREC.unary, seq(
      field("operator", choice("!", "-")),
      field("argument", $.expression),
    )),

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
      ":",
      field("type", $._type),
    ),

    dynamic_expression: $ => prec(PREC.call, seq(
      field("kind", choice("dynamic", "eval", "defer")),
      "(",
      field("source", $.expression),
      optional(field("type", $.type_annotation)),
      optional(seq(",", field("scope", $.variable_set))),
      ")",
    )),

    variable_set: $ => seq(
      "{",
      optional(seq(
        $.identifier,
        repeat(seq(",", $.identifier)),
      )),
      "}",
    ),

    call_expression: $ => prec.left(PREC.call, seq(
      field("function", choice(
        $.identifier,
        $.member_expression,
        $.parenthesized_expression,
        $.lambda_expression,
        $.dynamic_expression,
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
      field("index", $.integer),
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
      optional(seq(
        $.expression,
        repeat(seq(",", $.expression)),
      )),
      "]",
    ),

    object_literal: $ => seq(
      "{",
      optional(seq(
        $.object_entry,
        repeat(seq(",", $.object_entry)),
      )),
      "}",
    ),

    object_entry: $ => seq(
      field("key", choice($.identifier, $.string)),
      ":",
      field("value", $.expression),
    ),

    map_entry: $ => seq(
      field("key", $.string),
      ":",
      field("value", $.expression),
    ),

    ellipsis: _ => "...",

    boolean: _ => choice("true", "false"),

    unit: $ => seq("(", ")"),

    builtin_type: _ => token(choice(
      "Int",
      "Float",
      "Bool",
      "Str",
      "Unit",
      "Any",
    )),

    number: _ => token(choice(
      /(?:0|[1-9][0-9]*)\.[0-9]*(?:[eE]-?[0-9]+)?/,
      /[0-9]+/,
    )),

    integer: _ => token(/[0-9]+/),

    string: _ => token(/"[^"\\\n\r]*(?:\\[tn'"\\][^"\\\n\r]*)*"/),

    identifier: _ => /[A-Za-z_][A-Za-z0-9_]*/,

    line_comment: _ => token(seq("//", /.*/)),

    block_comment: _ => token(/\(\*[^*]*\*+(?:[^\)*][^*]*\*+)*\)/),
  },
});
