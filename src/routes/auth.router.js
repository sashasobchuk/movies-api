const Router = require("express")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const router = new Router()
const {User} = require("../db");
const SECRET_KEY = process.env.SECRET_KEY

router.post('/registration',
    async (req, res) => {
        try {
            const {username, password} = req.body;
            if (!username || !password) {
                return res.status(400).send('Missing required fields: username, password');
            }

            const candidate = await User.findOne({
                raw: true,
                where: {
                    username: username,
                },
            });

            if (candidate) {
                return res.status(409).json({message: `User with username ${username} already exist`})
            }

            const hashPassword = await bcrypt.hash(password, 8)

            const user = await User.create({username, passwordDigest: hashPassword}, {
                raw: true,

            })
            const {passwordDigest, ...rest} = user.dataValues
            return res.status(201).json(rest)
        } catch (error) {
            console.error(error);
            res.status(500).send('Error registering user', error);
        }
    })

router.post('/login',
    async (req, res) => {
        try {
            const {username, password} = req.body
            const user = await User.findOne({
                raw: true,
                where: {
                    username
                }
            })
            if (!user) {
                return res.status(404).json({message: `User ${username} not found`})
            }

            const isPassValid = bcrypt.compareSync(password, user.passwordDigest)
            if (!isPassValid) {
                return res.status(400).json({message: 'password not valid'})
            }

            const token = jwt.sign({id: user.id}, SECRET_KEY, {expiresIn: "10h"})

            const {passwordDigest, ...rest} = user
            return res.json({
                token,
                user: rest
            })
        } catch (error) {
            console.error(error);
            res.status(500).send('Error login');
        }
    }
)

module.exports = router