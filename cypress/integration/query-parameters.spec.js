context('Query string parameters', () => {
    describe('Applications should be available through $modena query string parameters', () => {
        it('', () => {
            cy.visit('http://localhost:3000/view?$modena=app1');
            
            cy
            .request({ url: 'http://localhost:3000/view', failOnStatusCode: false })
            .then((response) => {
                expect(response.status).to.be.equal(404);
            });

            cy
            .request('http://localhost:3000/view?$modena=app1')
            .then((response) => {
                expect(response.body).to.contain('App 1 EJS view');
            });
        });
    });
});
