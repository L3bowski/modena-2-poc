context('Public domains', () => {
    describe('Apps should be accessible through public domains', () => {
        it('', () => {
            cy.visit('http://test-domain.com:3000');

            cy
            .request('http://test-domain.com:3000')
            .then((response) => {
                expect(response.body).to.be.equal('Public domain app accessible at test-domain.com:3000');
            });
        });
    });
});
