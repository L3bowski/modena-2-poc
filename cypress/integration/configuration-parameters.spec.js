context('Configuration parameters', () => {
    describe('The configuration parameters should be fetched from the process.env', () => {
        it('', () => {
            cy.visit('http://localhost:3000/config-app');

            cy
            .request('http://localhost:3000/config-app')
            .then((response) => {
                expect(response.body).to.be.equal(JSON.stringify({
                    DB_HOST: "actual database host",
                    DB_USER: "actual database user",
                    DB_PASS: "actual database password"
                }));
            });
        });
    });
});
