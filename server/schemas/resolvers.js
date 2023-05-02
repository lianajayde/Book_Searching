const { AuthenticationError } = require('apollo-server-express'); 
const { User, Book } = require('../models');
const { signToken } = require('../utils/auth');


const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id })
                .select('-_v -password');
                return userData;
            }
            throw new AuthenticationError('Not logged in');
        }
    },

    Mutation: {
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError('Wrong info');
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Wrong info');
            }

            const token = signToken(user);
            return { token, user };
        },

        addUser: async (parent, { username, email, password }) => {
            const user = await User.create({ username, email, password });
            const token = signToken(user);
            return { token, user };
        },
    
        saveBook: async (parent, { input }, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $push: { savedBooks: input }},
                    { new: true }
                );
                return updatedUser;
            }
            throw new AuthenticationError('You may log in');
        },
        
        removeBook: async (parent, { bookId }, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId: bookId } } },
                    { new: true }
                );
                return updatedUser;
            }
            throw new AuthenticationError('You may log in');
    }}};


module.exports = resolvers;