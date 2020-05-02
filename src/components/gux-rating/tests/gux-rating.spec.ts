import { newSpecPage, SpecPage } from '@stencil/core/testing';
import { GuxRating } from '../gux-rating';

describe('gux-rating', () => {
  describe('#render', () => {
    [
      '<gux-rating></gux-rating>',
      '<gux-rating rating="0"></gux-rating>',
      '<gux-rating rating="1"></gux-rating>',
      '<gux-rating rating="2"></gux-rating>',
      '<gux-rating rating="3"></gux-rating>',
      '<gux-rating rating="4"></gux-rating>',
      '<gux-rating rating="5"></gux-rating>',
      '<gux-rating allow-half-ratings rating="0.5"></gux-rating>',
      '<gux-rating allow-half-ratings rating="1.5"></gux-rating>',
      '<gux-rating allow-half-ratings rating="2.5"></gux-rating>',
      '<gux-rating allow-half-ratings rating="3.5"></gux-rating>',
      '<gux-rating allow-half-ratings rating="4.5"></gux-rating>',
      '<gux-rating rating="0" max-rating=10></gux-rating>',
      '<gux-rating rating="5" max-rating=10></gux-rating>',
      '<gux-rating rating="10" max-rating=10></gux-rating>',
      '<gux-rating rating="3" disabled></gux-rating>'
    ].forEach((input, index) => {
      it(`should render component as expected (${index + 1})`, async () => {
        const page = await newSpecPage({
          components: [GuxRating],
          html: input
        });

        expect(page.root).toMatchSnapshot();
      });
    });
  });

  describe('#interactions', () => {
    async function clickStar(page: SpecPage, position: number): Promise<void> {
      const ratingElements = page.doc.getElementsByClassName(
        'gux-rating-element'
      );
      const ratingElement = ratingElements[position - 1] as HTMLElement;

      ratingElement.click();

      await page.waitForChanges();
    }

    function getStarCounts(
      document
    ): { emptyStars: number; halfStars: number; fullStars: number } {
      return {
        emptyStars: document.getElementsByClassName(
          'gux-rating-item-shape-fill-percent-0'
        ).length,
        fullStars: document.getElementsByClassName(
          'gux-rating-item-shape-fill-percent-100'
        ).length,
        halfStars: document.getElementsByClassName(
          'gux-rating-item-shape-fill-percent-50'
        ).length
      };
    }

    describe('full ratings', () => {
      let page: SpecPage;

      beforeEach(async () => {
        page = await newSpecPage({
          components: [GuxRating],
          html: '<gux-rating></gux-rating>'
        });
      });

      it(`should render five empty stars if nothing is clicked`, async () => {
        expect(getStarCounts(page.doc)).toEqual({
          emptyStars: 5,
          fullStars: 0,
          halfStars: 0
        });
      });

      it(`should render one full stars if the first one is clicked`, async () => {
        await clickStar(page, 1);

        expect(getStarCounts(page.doc)).toEqual({
          emptyStars: 4,
          fullStars: 1,
          halfStars: 0
        });
      });

      it(`should render five empty stars if the first one is clicked twice`, async () => {
        await clickStar(page, 1);
        await clickStar(page, 1);

        expect(getStarCounts(page.doc)).toEqual({
          emptyStars: 5,
          fullStars: 0,
          halfStars: 0
        });
      });

      it(`should render five full stars if the fifth one is clicked`, async () => {
        await clickStar(page, 5);

        expect(getStarCounts(page.doc)).toEqual({
          emptyStars: 0,
          fullStars: 5,
          halfStars: 0
        });
      });

      it(`should render five empty stars if the fifth one is clicked twice`, async () => {
        await clickStar(page, 5);
        await clickStar(page, 5);

        expect(getStarCounts(page.doc)).toEqual({
          emptyStars: 5,
          fullStars: 0,
          halfStars: 0
        });
      });
    });

    describe('half ratings', () => {
      let page: SpecPage;

      beforeEach(async () => {
        page = await newSpecPage({
          components: [GuxRating],
          html: '<gux-rating allow-half-ratings></gux-rating>'
        });
      });

      it(`should render five empty stars if nothing is clicked`, async () => {
        expect(getStarCounts(page.doc)).toEqual({
          emptyStars: 5,
          fullStars: 0,
          halfStars: 0
        });
      });

      it(`should render one half star if the first one is clicked`, async () => {
        await clickStar(page, 1);

        expect(getStarCounts(page.doc)).toEqual({
          emptyStars: 4,
          fullStars: 0,
          halfStars: 1
        });
      });

      it(`should render one full star if the first one is clicked twice`, async () => {
        await clickStar(page, 1);
        await clickStar(page, 1);

        expect(getStarCounts(page.doc)).toEqual({
          emptyStars: 4,
          fullStars: 1,
          halfStars: 0
        });
      });

      it(`should render no full stars if the first one is clicked three times`, async () => {
        await clickStar(page, 1);
        await clickStar(page, 1);
        await clickStar(page, 1);

        expect(getStarCounts(page.doc)).toEqual({
          emptyStars: 5,
          fullStars: 0,
          halfStars: 0
        });
      });

      it(`should render four full stars and one half one if the fifth one is clicked`, async () => {
        await clickStar(page, 5);

        expect(getStarCounts(page.doc)).toEqual({
          emptyStars: 0,
          fullStars: 4,
          halfStars: 1
        });
      });

      it(`should render five full stars if the fifth one is clicked twice`, async () => {
        await clickStar(page, 5);
        await clickStar(page, 5);

        expect(getStarCounts(page.doc)).toEqual({
          emptyStars: 0,
          fullStars: 5,
          halfStars: 0
        });
      });

      it(`should render no full stars if the fifth one is clicked three times`, async () => {
        await clickStar(page, 5);
        await clickStar(page, 5);
        await clickStar(page, 5);

        expect(getStarCounts(page.doc)).toEqual({
          emptyStars: 5,
          fullStars: 0,
          halfStars: 0
        });
      });
    });

    describe('disabled', () => {
      let page: SpecPage;

      beforeEach(async () => {
        page = await newSpecPage({
          components: [GuxRating],
          html: '<gux-rating rating="3" disabled></gux-rating>'
        });
      });

      it(`should render three full stars if nothing is clicked`, async () => {
        expect(getStarCounts(page.doc)).toEqual({
          emptyStars: 2,
          fullStars: 3,
          halfStars: 0
        });
      });

      it(`should render three full stars if anything is clicked`, async () => {
        await clickStar(page, 1);
        await clickStar(page, 2);
        await clickStar(page, 3);
        await clickStar(page, 4);
        await clickStar(page, 5);

        expect(getStarCounts(page.doc)).toEqual({
          emptyStars: 2,
          fullStars: 3,
          halfStars: 0
        });
      });
    });
  });
});
