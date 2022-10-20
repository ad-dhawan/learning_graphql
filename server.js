/*
--------------------------------------------------------------------------------
Beginning steps towards learning GraphQL using node Express and NodeJS

-Author
-- Ankit Dhawan
--------------------------------------------------------------------------------
-*/


/**
 * Importing Libraries
 */
const express = require('express');
const expressGraphQL = require('express-graphql').graphqlHTTP;
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull,
} = require('graphql');


/**
 * Express function
 */
const app = express();


/**
 * Importing dummy data
 */
const {feed} = require('./dummy-data/feed');
const {users} = require('./dummy-data/users');


/**
 * Creating Type Query
 */
const FeedType = new GraphQLObjectType({
    name: 'Feed',
    description: 'This represents a post from the feed',
    fields: () => ({
        id: { type: new GraphQLNonNull(GraphQLInt) },
        full_name: { type: new GraphQLNonNull(GraphQLString) },
        user_name: { type: new GraphQLNonNull(GraphQLString) },
        user_avatar: { type: new GraphQLNonNull(GraphQLString) },
        image_url: { type: new GraphQLNonNull(GraphQLString) },
        likes: { type: new GraphQLList(
            new GraphQLObjectType({
                name: 'UserID',
                description: 'User ID of person who liked the post',
                fields: () => ({
                    id: { type: GraphQLInt }
                })
            })
        ) },
    })
})

const UserType = new GraphQLObjectType({
    name: 'User',
    description: 'This represents a user from dummy data',
    fields: () => ({
        user_id: { type: GraphQLInt },
        full_name: { type: GraphQLString },
        user_name: { type: GraphQLString },
        user_avatar: { type: GraphQLString },
    })
})


/**
 * Declaring Query Type
 */
const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        getFeed: {
            type: new GraphQLList(FeedType),
            description: 'List of every post',
            resolve: () => feed
        },

        getUsers: {
            type: new GraphQLList(UserType),
            description: 'All users from the list',
            resolve: () => users
        },

        getPost: {
            type: FeedType,
            description: 'Single post from the feed',
            args: {
                id: { type: GraphQLInt}
            },
            resolve: (parent, args) => feed.find(post => post.id === args.id)
        },

        getUser: {
            type: UserType,
            description: 'Single user from the list',
            args: {
                user_id: { type: GraphQLInt }
            },
            resolve: (parent, args) => users.find(user => user.user_id === args.user_id)
        }
    })
})


/**
 * Declaring Mutation Type
 */
const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
        addPost: {
            type: FeedType,
            description: 'Add a new post',
            args: {
                full_name: { type: new GraphQLNonNull(GraphQLString) },
                user_name: { type: new GraphQLNonNull(GraphQLString) },
                user_avatar: { type: new GraphQLNonNull(GraphQLString) },
                image_url: { type: new GraphQLNonNull(GraphQLString) },
            },
            resolve: (parent, args) => {
                const post = {
                    id: feed.length + 1,
                    full_name: args.full_name,
                    user_name: args.user_name,
                    user_avatar: args.user_avatar,
                    image_url: args.image_url,
                }
                feed.push(post)
                return post
            }
        },
    
        addUser: {
            type: UserType,
            description: 'Add a new user',
            args: {
                full_name: { type: new GraphQLNonNull(GraphQLString) },
                user_name: { type: new GraphQLNonNull(GraphQLString) },
                user_avatar: { type: new GraphQLNonNull(GraphQLString) },
            },
            resolve: (parent, args) => {
                const user = {
                    user_id: users.length + 1,
                    full_name: args.full_name,
                    user_name: args.user_name,
                    user_avatar: args.user_avatar,
                }
                users.push(user)
            return user
            }
        }
    })
})


/**
 * Declaring Schema
 */
const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
})


/**
 * Middleware
 */
app.use('/graphql', expressGraphQL({
    schema: schema,
    graphiql: true
}))


/**
 * Running Server
 */
app.listen(process.env.PORT || 3000, function(){
    console.log(`🚀 Server is running \n-- Port: ${this.address().port} \n-- Environment: ${app.settings.env} mode`);
});

