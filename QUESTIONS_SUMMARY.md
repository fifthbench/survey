# FifthBench Survey — Short Question Labels Cheat Sheet

This file provides a **1 to 2-word identifier** for each question asked in the FifthBench interactive survey. You can use these short labels as column headers for Excel/CSV exports, database schema fields, Google Form short titles, or reporting dashboards.

---

## 🚀 Quick Copy List (1-2 Words Per Question)

1. **Current Situation**
2. **Past Purchases**
3. **Usual Spend**
4. **Buying Reason**
5. **Product Appeal**
6. **Preferred Design**
7. **Product Format**
8. **Personalisation Choice**
9. **Biggest Concern**
10. **Brand Reason**
11. **Trust Factors**
12. **Order Channel**
13. **Preorder Comfort**
14. **Reasonable Price**
15. **Purchase Intent**
16. **User Feedback**

---

## 📋 Full Mapping Table

| # | Section | Full Question Asked | Short Label (1-2 Words) | App / Database Key (`data-qid`) |
|---|---|---|---|---|
| **1** | Demographics | Which best describes your current situation? | **Current Situation** | `situation` |
| **2** | Section 1: Buying Behaviour | Which of these have you bought in the last 12 months? | **Past Purchases** | `buying_12m` |
| **3** | Section 1: Buying Behaviour | What do you usually spend on one small gift or decor item? | **Usual Spend** | `usual_spend` |
| **4** | Section 2: Product Idea | What would be your most likely reason to consider this product? | **Buying Reason** | `consider_reason` |
| **5** | Section 2: Product Idea | Overall, how appealing is this product idea to you? | **Product Appeal** | `appeal_rating` |
| **6** | Section 2: Product Idea | Which design would you most like to see in the first collection? | **Preferred Design** | `first_collection_design` |
| **7** | Section 3: Product Choices | Which option would you prefer most? | **Product Format** | `product_option_preference` |
| **8** | Section 3: Product Choices | Which one personalisation option would matter most to you? | **Personalisation Choice** | `personalisation_preference` |
| **9** | Section 3: Product Choices | What would be your biggest concern? | **Biggest Concern** | `biggest_concern` |
| **10** | Section 4: Brand & Buying | Which one feels like the strongest reason to choose this brand? | **Brand Reason** | `strongest_brand_reason` |
| **11** | Section 4: Brand & Buying | What would you need to see before trusting the brand enough to order? | **Trust Factors** | `brand_trust_factors` |
| **12** | Section 4: Brand & Buying | Where would you feel most comfortable placing the order? | **Order Channel** | `order_channel` |
| **13** | Section 5: Pre-order & Price | Would you be comfortable ordering through a pre-order if the production and delivery date were clearly shown? | **Preorder Comfort** | `preorder_comfort` |
| **14** | Section 5: Pre-order & Price | What total product price feels reasonable for this complete kit? | **Reasonable Price** | `reasonable_kit_price` |
| **15** | Section 5: Pre-order & Price | If this complete kit cost Rs 899 plus delivery, how likely would you be to buy it in the next three months...? | **Purchase Intent** | `purchase_likelihood_899` |
| **16** | Section 5: Feedback | What is the one thing you would change or improve about this product idea? | **User Feedback** | `improvement_idea` |

---

## 💡 Single-Word Alternative Tags

If you specifically need strictly **1-word** tags for code identifiers or CSV header keys:

1. `Situation`
2. `Purchases`
3. `Budget`
4. `Purpose`
5. `Appeal`
6. `Design`
7. `Format`
8. `Customization`
9. `Concern`
10. `Motivation`
11. `Trust`
12. `Channel`
13. `Preorder`
14. `Valuation`
15. `Intent`
16. `Feedback`

> **Note**: For Question 16 (`improvement_idea` / `User Feedback`), if the user submits without entering any text, the application automatically defaults the response to `"no feedback"`.
