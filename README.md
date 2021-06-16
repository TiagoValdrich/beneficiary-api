# Beneficiary API

A NodeJS API to manage bank details of beneficiaries.

## Running the application locally

For running the application on your local environment you'll need to have NodeJS installed in order to run it. As the project was developed with version `14.16.1`, I strongly recommend using the same version to avoid possible problems.

If you have [nvm](https://github.com/nvm-sh/nvm) installed, you can simply run the following commands to prepare your NodeJS environment:

```bash
# Installing Node Version 14.16.1
$ nvm install v14.16.1
# Using the version installed
$ nvm use
```

After installing it, you can check if everything is correct by running:

```bash
$ node -v
# It should appear
v14.16.1
```

And then, install the project dependencies that are required to run it:

```bash
$ npm install
```

### Database - MySQL

For persisting data, the project is using a MySQL database with the version `8.0.25`. You can install it manually on your local machine, but I strongly recommend to use a MySQL docker container to make easy to setup your local environment. Below there is a command to setup a MySQL container with the dabase `dev_test` already created available on port `3306`, with the user `root` and the ~~beautiful and secure~~ password `123`.

> The container bellow is ready to be used with the default environment variables showed in `.env.example`.

```bash
docker run -d --name mysql-beneficiary-api -p "3306:3306" -e MYSQL_ROOT_PASSWORD=123 -e MYSQL_DATABASE=dev_test mysql:8.0.25
```

### Environment variables

Last but not least, you'll need to create a `.env` with the "configurations" of the application. If you're using the MySQL container from the previous topic, you can simply copy the whole `.env.example` to `.env` file, and everything will work fine.

### Running the API

Now that you have done the previous steps, just run on your terminal `npm start` and the application should start running or port `3000`, and if you didn't change the environment variable `AUTH_TOKEN`, the bearer token to authenticate in the API is `test_token`.

## Running the application with docker-compose (Recommended way)

As I didn't pushed the project image to a container registry, you'll need to build the docker image manually with the following command:

```bash
$ docker build -t beneficiary-api:test .
```

Ideally this image name must be with this name and tag, because the `docker-compose.yml` is configured to used it, but if you want to change it, feel free, but don't forget to update the image name no `docker-compose.yml`.

After building the project image, now you should be ready for running the docker-compose file:

```bash
$ docker-compose up -d
```

And if you want to stop it:

```bash
$ docker-compose down
```

This compose will setup 3 containers:

- MySQL container with the database `dev-test` created, running on port `3306`, accessible with the user `root` and password `123`;
- The beneficiary API, running on port `3000`;
- Swagger container, containing the project documentation/routes, available on port 5000;

## Testing

For running test and check the project coverage, run the following command:

> **Observation**: For running tests you also need to have a MySQL running on your local environment!

```bash
$ npm test
```

## Documentation (API routes)

If you are a postman user, you can import the collection file available at `docs/BeneficiaryAPI.postman_collection.json` on your Postman and you are good to go.

Also is available a documentation using Swagger, available on `docs/BeneficiaryAPI.Swagger20.json`. This doc can be visualizated using the swagger container specified in docker-compose.yml, by simply running:

```bash
$ docker-compose up -d documentation
```

It will be available on `http://localhost:5000`.

> **Observation**: As I used a tool to parse the postman collection to swagger "format", the swagger documentation can have some weird stuff going on.
