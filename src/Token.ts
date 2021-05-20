import TokenType from './TokenType'

export default class Token {
  type:      TokenType
  text:      string
  position:  number

  constructor (type: TokenType, text: string, position:  number) {
    this.text     = text
    this.type     = type
    this.position = position
  }
}