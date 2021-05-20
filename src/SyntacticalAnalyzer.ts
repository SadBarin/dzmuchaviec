import Token               from './Token'
import TokenType           from './TokenType'
import { tokenTypesList }  from './TokenType'
import ExpressionNode      from './AST/ExpressionNode'
import StatementsNode      from './AST/StatementsNode'
import NumberNode          from './AST/NumberNode'
import VariableNode        from './AST/VariableNode'
import BinaryOperationNode from './AST/BinaryOperationNode'
import UnaryOperationNode  from './AST/UnaryOperationNode'

export default class SyntacticalAnalyzer {
  tokens: Token[]
  position: number = 0
  scope: any = {}

  constructor(tokens: Token[]) {
    this.tokens = tokens
  }

  match(...expected: TokenType[]): Token | null {
    if (this.position < this.tokens.length) {
      const currentToken = this.tokens[this.position]

      if (expected.find(type => type.name === currentToken.type.name)) {
        this.position += 1

        return currentToken
      }
    }

    return null;
  }

  require(...expected: TokenType[]): Token {
    const token = this.match(...expected)

    if (!token) throw new Error(`На пазіцыі ${this.position} чакаецца ${expected[0].name}`)

    return token
  }

  doParseVariableOrNumber(): ExpressionNode {
    const number = this.match(tokenTypesList.NUMBER)

    if (number != null) return new NumberNode(number)

    const variable = this.match(tokenTypesList.VARIABLE)

    if (variable != null) return new VariableNode(variable)

    throw new Error(`Чакаецца пераменная альбо лічба на ${this.position} пазіцыі`)
  }

  doParseParentheses(): ExpressionNode {
    if (this.match(tokenTypesList.LPAR) != null) {
      const node = this.doParseFormula()
      this.require(tokenTypesList.RPAR)

      return node
    } else {
      return this.doParseVariableOrNumber()
    }
  }

  doParseFormula(): ExpressionNode {
    let leftNode = this.doParseParentheses();
    let operator = this.match(tokenTypesList.MINUS, tokenTypesList.PLUS)

    while (operator != null) {
      const rightNode = this.doParseParentheses()

      leftNode = new BinaryOperationNode(operator, leftNode, rightNode)
      operator = this.match(tokenTypesList.MINUS, tokenTypesList.PLUS)
    }

    return leftNode
  }

  doParsePrint(): ExpressionNode {
    const operatorSee = this.match(tokenTypesList.SEE)

    if (operatorSee != null) return new UnaryOperationNode(operatorSee, this.doParseFormula())

    throw new Error(`Чакаецца унарный аператар КАНСОЛЬ на ${this.position} пазіцыі`)
  }

  doParseExpression(): ExpressionNode {
    if (this.match(tokenTypesList.VARIABLE) == null) {
      const printNode = this.doParsePrint()

      return printNode
    }

    this.position -= 1

    let variableNode = this.doParseVariableOrNumber()
    const assignOperator = this.match(tokenTypesList.ASSIGN)

    if (assignOperator != null) {
      const rightFormulaNode = this.doParseFormula()
      const binaryNode = new BinaryOperationNode(assignOperator, variableNode, rightFormulaNode)

      return binaryNode
    }

    throw new Error(`Пасля зменнай чакаецца аператар прысвойвання на пазіцыі ${this.position}`)
  }

  doParseCode(): ExpressionNode {
    const root = new StatementsNode()

    while (this.position < this.tokens.length) {
      const codeStringNode = this.doParseExpression()
      this.require(tokenTypesList.POINT)
      root.addNode(codeStringNode)
    }

    return root
  }

  run(node: ExpressionNode): any {
    if (node instanceof NumberNode) return parseInt(node.number.text)

    if (node instanceof UnaryOperationNode) {
      switch (node.operator.type.name) {
        case tokenTypesList.SEE.name:
          console.log(this.run(node.operand))

          return
      }
    }

    if (node instanceof BinaryOperationNode) {
      switch (node.operator.type.name) {
        case tokenTypesList.PLUS.name:
          return this.run(node.leftNode) + this.run(node.rightNode)

        case tokenTypesList.MINUS.name:
          return this.run(node.leftNode) - this.run(node.rightNode)

        case tokenTypesList.ASSIGN.name:
          const result = this.run(node.rightNode)
          const variableNode = <VariableNode>node.leftNode
          this.scope[variableNode.variable.text] = result

          return result
      }
    }

    if (node instanceof VariableNode) {
      if (this.scope[node.variable.text]) {
        return this.scope[node.variable.text]
      } else {
        throw new Error(`Пераменная з назвай ${node.variable.text} ня выяўлена`)
      }
    }

    if (node instanceof StatementsNode) {
      node.codeStrings.forEach(codeString => {
        this.run(codeString)
      })

      return
    }

    throw new Error('Невядомая памылка')
  }
}