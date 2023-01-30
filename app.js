const express = require("express");
const bodyParser = require("body-parser");
const graphqlHttp = require("express-graphql").graphqlHTTP;
const { buildSchema } = require("graphql");
const mongoose = require("mongoose");
const { addPath } = require("graphql/jsutils/Path");
const Event = require("./models/event.js");

const app = express();

app.use(bodyParser.json());

//-----const events = []; //temp datastore for Events.

//form single graphql End-point
app.use(
  "/endpoint",
  graphqlHttp({
    //this graphqlHttp method is a middle ware that runs when this endpoint is hit, same as (req,res,callback)....
    //Here we need to define where to find the schemas (type of data expectations) and resolvers (what is needed to
    //be done once query is identified) or define them.
    schema: buildSchema(
      //The type bundles up the "query" type and "Mutation" type requests defining what the request looks like and in
      //which bundle it belongs and what are the passed arguments to the request and what is expected to be returned.
      //The schema defines which type bundle belongs to which schema type (query/mutation/subscrption).
      //The rootValue key holds object defining the resolver to each query/mutation (schema type).
      //Resolvers needs to have same names as schema keys.
      //Event here is the instance of how a DB instance looks like to GraphQL. EventInput is of input
      //type which is used to isolate schema of event from others. It is a cover over Event schema to use it in case Event needs to
      //be an argument to a resolver.
      `
        type Event{
            _id:ID!
            title: String!
            description: String!
            price: Float!
            date: String!
        }
        input EventInput{
            title: String!
            description: String!
            price: Float!
            date: String!
        }
        type RootQuery{
            events: [Event!]!
        }
        type RootMutation{
            createEvent(eventInput: EventInput): Event
        }
        schema{
            query: RootQuery
            mutation: RootMutation
        }
        `
    ),
    //resolvers are simply bunch of functions/func ref.

    rootValue: {
      events: (args) => {
        //args is empty object
        //no filter to find, hence whole table/collection is returned.
        return Event.find()
          .then((res) => {
            return res.map((r) => {
              return { ...r._doc, _id: r._doc._id.toString() };
            });
          })
          .catch((err) => {
            console.log(err);
          });
      },
      createEvent: (args) => {
        //args contains name property as createEvent must have request passed.
        const event = new Event({
          title: args.eventInput.title,
          description: args.eventInput.description,
          price: args.eventInput.price,
          date: args.eventInput.date,
        });

        return event
          .save()
          .then((r) => {
            return { ...r._doc }; // mongo DB returns object with lots of meta data. To get only the needed ones (cols) we spread response and use _doc attribute.
          })
          .catch((err) => {
            console.log(err);
          });
      },
    },
    graphiql: true, //UI to test our GraphQL api endpoint. Address: "App.js address"/<your Endpoint, here "endpoint">
  })
);

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@graphqlcluster.vwwe2vj.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`
  )
  .then(() => {
    //if DB gets connected then only listen to requests.
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
