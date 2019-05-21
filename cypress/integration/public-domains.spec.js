context('Public domains', () => {
    describe('Apps should be accessible through public domains', () => {
        it('', () => {
            cy
            .request('http://test-domain.com:3000')
            .then((response) => {
                expect(response.body).to.be.equal('Public domain app accessible at test-domain.com:3000');
            });
        });
    });

    describe('Cross access', () => {
        it('Cross access app should be disabled when publicDomainCrossAccess is not set to true', () => {
            cy
            .request({ url: 'http://test-domain.com:3000/default-app', failOnStatusCode: false })
            .then((response) => {
                expect(response.status).to.be.equal(404);
            });
        });

        // TODO Fix Cypress segmentation fault when running this test
        // it('Cross access app should be enabled when publicDomainCrossAccess is set to true', () => {
        //     cy
        //     .request('http://test-cross-domain:3000/default-app')
        //     .then((response) => {
        //         expect(response.body).to.contain('This is the app that will run on the modena server by default');
        //     });
        // });
    });
});
