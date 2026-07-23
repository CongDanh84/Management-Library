const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
    _id: { type: String, required: true},
    seq: { type: Number, default: 0}
});

const Counter = mongoose.model('Counter', counterSchema);

async function generateCode(key, prefix, padLength = 4) {
    const counter = await  Counter.findOneAndUpdate(
        {_id: key},
        {$inc: {seq:1}},
        {new: true, upsert: true}
    );
    return `${prefix}${counter.seq.toString().padStart(padLength,'0')}`;
}

module.exports = {Counter, generateCode};