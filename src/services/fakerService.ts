export class FakerService {
    generateFakeData() {
        const faker = require('faker');
        return {
            name: faker.name.findName(),
            email: faker.internet.email(),
            address: faker.address.streetAddress(),
            text: faker.lorem.sentence(),
        };
    }
}