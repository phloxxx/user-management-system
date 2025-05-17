const { expressjwt } = require('express-jwt');
const db = require('../_helpers/db');

module.exports = authorize;

function authorize(roles = []) {
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return [
        // authenticate JWT token and attach decoded token to request as req.auth
        expressjwt({ 
            secret: process.env.JWT_SECRET || 'your-default-secret-key',
            algorithms: ['HS256'] 
        }),

        // authorize based on user role
        async (req, res, next) => {
            try {
                const account = await db.Account.findByPk(req.auth.id);
                
                if (!account || (roles.length && !roles.includes(account.role))) {
                    return res.status(401).json({ message: 'Unauthorized' });
                }

                // authentication and authorization successful
                req.user = account.get();
                const refreshTokens = await account.getRefreshTokens();
                req.user.ownsToken = token => !!refreshTokens.find(x => x.token === token);
                next();
            } catch (error) {
                next(error);
            }
        }
    ];
}