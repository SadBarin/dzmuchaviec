import Token              from './Token'
import { tokenTypesList } from './TokenType'

export default class LexicalAnalyzer {
  code:      string
  position:  number = 0
  tokenList: Token[] = []

  constructor (code: string) {
    this.code = code
  }

  doLexicalAnalysis () : Token[] {
    while (this.getNextToken()) {}
    this.tokenList = this.tokenList.filter(
      token => token.type.name !== tokenTypesList.SPACE.name
      )

    return this.tokenList
  }

  getNextToken () : boolean {
    if (this.position >= this.code.length) return false

    const tokenTypesValues = Object.values(tokenTypesList)

    for (let i = 0; i < tokenTypesValues.length; i++) {
      const tokenType = tokenTypesValues[i];
      const regex     = new RegExp('^' + tokenType.regex);
      const result    = this.code.substr(this.position).match(regex);

      if (result && result[0]) {
          const token = new Token(tokenType, result[0], this.position);
          this.position += result[0].length;
          this.tokenList.push(token);
          return true;
      }
    }

    throw new Error(`На пазіцыі ${this.position} знойдзена памылка!`)
  }
}