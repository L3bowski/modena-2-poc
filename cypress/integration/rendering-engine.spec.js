context('Rendering engine', () => {
    describe('Each app views should be isolated from the rest', () => {
        it('App 1 view access', () => {
            cy.visit('http://localhost:3000/app1/view');
            cy
            .request('http://localhost:3000/app1/view')
            .then((response) => {
                expect(response.body).to.contain('App 1 EJS view');
            });
        });

        it('App 2 view access', () => {
            cy.visit('http://localhost:3000/app2/view');
            cy
            .request('http://localhost:3000/app2/view')
            .then((response) => {
                expect(response.body).to.contain('App 2 EJS view');
            });
        });
    });
});
