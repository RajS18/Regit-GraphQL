const express = require('express');
const bodyParser = require('body-parser');
const  graphqlHttp = require('express-graphql').graphqlHTTP;
const { buildSchema } = require('graphql');

const app = express();

app.use(bodyParser.json());

//form single graphql End-point
app.use('/endpoint',graphqlHttp({
    //this graphqlHttp method is a middle ware that runs when this endpoint is hit, same as (req,res,callback)....
    //Here we need to define where to find the schemas (type of data expectations) and resolvers (what is needed to 
    //be done once query is identified) or define them.
    schema: buildSchema(
        //The type bundles up the "query" type and "Mutation" type requests defining what the request looks like and in 
        //which bundle it belongs and what are the passed arguments to the request and what is expected to be returned.
        //The schema defines which type bundle belongs to which schema type (query/mutation/subscrption).
        //The rootValue key holds object defining the resolver to each query/mutation (schema type). Resolvers needs to have same names as schema keys.
        `
        type RootQuery{
            events: [String!]!
        }
        type RootMutation{
            createEvent(name: String): String
        }
        schema{
            query: RootQuery
            mutation: RootMutation
        }
        `
    ),
    //resolvers are simply bunch of functions/func ref. 

    rootValue: {
        events: (args)=>{
            //args is empty object
            return ['Hockey','Coding','Gaming','ballet dance']
        },
        createEvents:(args)=>{
            //args contains name property as createEvent must have request passed.
            return args.name;
        }
    },
    graphiql:true, //UI to test our GraphQL api endpoint. Address: "App.js address"/<your Endpoint, here "endpoint">
}));


app.listen(3000);
