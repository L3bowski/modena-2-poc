context('Default app', () => {
    describe('The default app should be exposed at the server root url', () => {
        it('', () => {
            cy.visit('http://localhost:3000');

            cy
            .request('http://localhost:3000')
            .then((response) => {
                expect(response.body).to.be.equal('This is the app that will run on the modena server by default');
            });
        });
    });
});
