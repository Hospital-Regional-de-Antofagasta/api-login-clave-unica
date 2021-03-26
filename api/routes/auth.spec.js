const auth = require('./auth')
describe('src', () => {
    describe('auth', () => {
        it('should return token', () => {
            const user = {
                nombre: "Nombre",
                rut: "rut",
            }
            const req = {
                body: user,
            }
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
            }
            auth ().login(req, res)
            expect(res.status.mock.calls).toEqual([
                [201]
            ])
            expect(res.send.mock.calls).toEqual([
                [
                    { 
                        token: "",
                        refresh_token: "",
                        token_expire_at: "",
                    }
                ]
            ])
        })
    })
})