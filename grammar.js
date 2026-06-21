const PREC = {
  implication: 1,
  or: 2,
  and: 3,
  equality: 4,
  comparison: 5,
  additive: 6,
  multiplicative: 7,
  unary: 8,
  member: 9,
  call: 10,
};

module.exports = grammar({
  name: "dsrv",

  extras: $ => [
    /\s/,
    $.line_comment,
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
      $.builtin_type,
      $.identifier,
    ),

    struct_type: $ => seq(
      "Struct",
      "<",
      optional(seq(
        choice($.struct_field_type, $.ellipsis),
        repeat(seq(",", choice($.struct_field_type, $.ellipsis))),
        optional(","),
      )),
      ">",
    ),

    struct_field_type: $ => seq(
      field("name", $.identifier),
      ":",
      field("type", $._type),
    ),

    generic_type: $ => seq(
      field("constructor", choice("List", "Map", $.identifier)),
      "<",
      field("argument", $._type),
      repeat(seq(",", field("argument", $._type))),
      optional(","),
      ">",
    ),

    assignment: $ => seq(
      field("left", $.identifier),
      "=",
      field("right", $.expression),
    ),

    expression: $ => choice(
      $.if_expression,
      $.binary_expression,
      $.unary_expression,
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
    ),

    if_expression: $ => prec.right(seq(
      "if",
      field("condition", $.expression),
      "then",
      field("consequence", $.expression),
      "else",
      field("alternative", $.expression),
    )),

    binary_expression: $ => choice(
      prec.right(PREC.implication, seq(field("left", $.expression), "=>", field("right", $.expression))),
      prec.left(PREC.or, seq(field("left", $.expression), "||", field("right", $.expression))),
      prec.left(PREC.and, seq(field("left", $.expression), "&&", field("right", $.expression))),
      prec.left(PREC.equality, seq(field("left", $.expression), choice("==", "!="), field("right", $.expression))),
      prec.left(PREC.comparison, seq(field("left", $.expression), choice("<=", ">=", "<", ">"), field("right", $.expression))),
      prec.left(PREC.additive, seq(field("left", $.expression), choice("+", "-", "++"), field("right", $.expression))),
      prec.left(PREC.multiplicative, seq(field("left", $.expression), choice("*", "/", "%"), field("right", $.expression))),
    ),

    unary_expression: $ => prec(PREC.unary, seq(
      field("operator", choice("!", "-")),
      field("argument", $.expression),
    )),

    call_expression: $ => prec(PREC.call, seq(
      field("function", choice($.identifier, $.member_expression)),
      "(",
      optional(seq($.expression, repeat(seq(",", $.expression)), optional(","))),
      ")",
    )),

    index_expression: $ => prec(PREC.member, seq(
      field("value", $.expression),
      "[",
      field("index", $.expression),
      "]",
    )),

    member_expression: $ => prec.left(PREC.member, seq(
      field("object", $.expression),
      ".",
      field("property", $.identifier),
    )),

    parenthesized_expression: $ => seq("(", $.expression, ")"),

    list_literal: $ => seq(
      "[",
      optional(seq($.expression, repeat(seq(",", $.expression)), optional(","))),
      "]",
    ),

    object_literal: $ => seq(
      "{",
      optional(seq($.object_entry, repeat(seq(",", $.object_entry)), optional(","))),
      "}",
    ),

    object_entry: $ => seq(
      field("key", choice($.identifier, $.string, $.number)),
      ":",
      field("value", $.expression),
    ),

    ellipsis: _ => "...",

    boolean: _ => choice("true", "false"),

    builtin_type: _ => token(choice("Int", "Float", "Bool", "Str", "Unit")),

    number: _ => token(choice(
      /[0-9]+\.[0-9]+/,
      /[0-9]+/,
    )),

    string: _ => token(seq(
      '"',
      repeat(choice(/[^"\\]+/, /\\./)),
      '"',
    )),

    identifier: _ => /[A-Za-z_][A-Za-z0-9_]*/,

    line_comment: _ => token(seq("//", /.*/)),
  },
});
