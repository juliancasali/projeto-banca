const mongoose = require('mongoose');

const bancaSchema = new mongoose.Schema({
        titulo: {
            type: String,
            required: true
        },

        aluno: {
            type: String,
            required: true
        },

        orientador: {
            type: String,
            required: true
        },

        data: {
            type: Date,
            required: true
        },

        status: {
            type: String,
            enum: ["agendada", "concluida"],
            default: "agendada"
        },

        curso: {
            type: String
        },

        tags: {
            type: [String],
            default: []
        },

        membros: {
            type: [
                {
                    id: { type: String },
                    nome: { type: String, required: true }
                }
            ],
        },
    },
    {timestamps: true}
);


// Cria uma propriedade virtual "id" baseada em "_id"
bancaSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

// Configura o toJSON para incluir virtuals e remover _id e __v
bancaSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
        return ret;
    }
});

module.exports = mongoose.model('Banca', bancaSchema);
