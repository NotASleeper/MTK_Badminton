class PriceComponent {
    calculate() {
        return 0;
    }
}

// Base Price
class BasePrice extends PriceComponent {
    constructor(amount) {
        super();
        this.amount = amount;
    }
    calculate() {
        return this.amount;
    }
}

// Decorator: Promotion
class PromotionDecorator extends PriceComponent {
    constructor(priceComponent, discountPercent) {
        super();
        this.priceComponent = priceComponent;
        this.discount = discountPercent;
    }
    calculate() {
        return this.priceComponent.calculate() * (1 - this.discount / 100);
    }
}

// Decorator: VAT Tax
class TaxDecorator extends PriceComponent {
    constructor(priceComponent, taxRate = 10) {
        super();
        this.priceComponent = priceComponent;
        this.taxRate = taxRate;
    }
    calculate() {
        return this.priceComponent.calculate() * (1 + this.taxRate / 100);
    }
}

module.exports = {
    BasePrice,
    PromotionDecorator,
    TaxDecorator,
};
