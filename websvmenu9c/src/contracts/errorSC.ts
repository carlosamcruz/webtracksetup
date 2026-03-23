import {
    assert,
    ByteString,
    method,
    prop,
    sha256,
    Sha256,
    SmartContract,
    toByteString,
} from 'scrypt-ts'

export class ErrorSC extends SmartContract {
    @prop()
    msgError: ByteString

    constructor() {
        super(...arguments)
        this.msgError = toByteString('0101')
    }

    @method()
    public unlock() {
        assert(toByteString('0101') == this.msgError, 'Hash does not match')
    }
}
