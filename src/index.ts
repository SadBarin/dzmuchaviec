import LexicalAnalyzer     from './LexicalAnalyzer'
import SyntacticalAnalyzer from './SyntacticalAnalyzer'

const code = `
  сума = 5 + 9.
  
  УБАЧЫЦЬ сума - 4.
`

const lexer = new LexicalAnalyzer(code)
lexer.doLexicalAnalysis()

const parser   = new SyntacticalAnalyzer(lexer.tokenList)
const rootNode = parser.doParseCode()

parser.run(rootNode)