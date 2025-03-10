const chatRouter = require('./chatRouter');
const voucherRouter = require('./voucherRouter');

function route(app){
    app.use('/api/chats/', chatRouter);
    app.use('/api/vouchers/', voucherRouter);

}

module.exports = route