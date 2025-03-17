const chatRouter = require('./chatRouter');
const voucherRouter = require('./voucherRouter');
const uploadRouter = require('../helper/uploadRouter')

function route(app){
    app.use('/api/chats/', chatRouter);
    app.use('/api/vouchers/', voucherRouter);
    // app.use('/api/upload/', uploadRouter)

}

module.exports = route