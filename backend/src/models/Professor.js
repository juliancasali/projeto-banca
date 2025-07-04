const mongoose = require('mongoose');

const professorSchema = new mongoose.Schema({
        nome: {
            type: String,
            required: true,
            minLength: 3,
            maxLength: 50
        },

        email: {
            type: String,
            required: true,
            unique: true,
            minLength: 4,
            maxLength: 100
        },

        departamento: {
            type: String,
            required: true,
        },

        titulacao: {
            type: String,
            required: true,
        },

        especialidades: {
            type: [String],
            required: true,
            default: [],
        },

        disponivel: {
            type: Boolean,
            default: true,
        }
    },
    {timestamps: true});

// Cria uma propriedade virtual "id" baseada em "_id"
professorSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

// Configura o toJSON para incluir virtuals e remover _id e __v
professorSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
        return ret;
    }
});


module.exports = mongoose.model('Professor', professorSchema);