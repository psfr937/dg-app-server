const GraknClient = require("grakn-client");

export const openSession = async(keyspace) => {
  const client = new GraknClient("localhost:48555");
  const session = await client.session(keyspace);
  // session is open
  await session.close();
  //session is closed
  client.close();
};

export const createTransactions = async(keyspace) => {
  const client = new GraknClient("localhost:48555");
  const session = await client.session(keyspace);

  // creating a write transaction
  const writeTransaction = await session.transaction().write(); // write transaction is open
  // to persist changes, write transaction must always be committed/closed
  await writeTransaction.commit();

  // creating a read transaction
  const readTransaction = await session.transaction().read(); // read transaction is open
  // read transaction must always be closed
  await readTransaction.close();
  // a session must always be closed
  await session.close();
  // a client must always be closed
  client.close();
}

async function runBasicQueries (keyspace) {
  const client = new GraknClient("localhost:48555");
  const session = await client.session(keyspace);

  // Insert a person using a WRITE transaction
  const writeTransaction = await session.transaction().write();
  const insertIterator = await writeTransaction.query('insert $x isa person, has email "x@email.com";');
  const concepts = await insertIterator.collectConcepts()
  console.log("Inserted a person with ID: " + concepts[0].id);
  // to persist changes, a write transaction must always be committed (closed)
  await writeTransaction.commit();

  // Retrieve persons using a READ only transaction
  const readTransaction = await session.transaction().read();

  // We can either query and consume the iterator lazily
  let answerIterator = await readTransaction.query("match $x isa person; get; limit 10;");
  let aConceptMapAnswer = await answerIterator.next();
  while (aConceptMapAnswer != null) {
    // get the next `x`
    const person = aConceptMapAnswer.map().get("x");
    console.log("Retrieved person with id "+ person.id);
    aConceptMapAnswer = await answerIterator.next();
  }

  // Or query and consume the iterator immediately collecting all the results
  answerIterator = await readTransaction.query("match $x isa person; get; limit 10;");
  const persons = await answerIterator.collectConcepts();
  persons.forEach( person => { console.log("Retrieved person with id "+ person.id) });

  // a read transaction must always be closed
  await readTransaction.close();
  // a session must always be closed
  await session.close();
  // a client must always be closed
  client.close();
}