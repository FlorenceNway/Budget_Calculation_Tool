Object.defineProperty(global.Element.prototype, 'innerText', {
    get() {
      return this.textContent;
    },
    set(str) {
        this.innerHTML = this.textContent = str;
    }
  });

document.body.innerHTML = `
    <nav>
    Emergency Ration Budget Tool
    </nav>
    <main>
        <div id="cart">
            <div id="products">
                <h3>Choose your products</h3>
            </div>
            <div id="remaining">Remaining budget: <span>£50.00</span></div>
        </div>
    </main>
`;

const products = [
  {
    id: 1,
    name: "Hand sanitiser",
    img:
      "https://i5.walmartimages.com/asr/f1728857-3120-4a4e-b474-d66f8ad1bc77_1.7e41f79bcada186bbbc136d1094be906.jpeg?odnWidth=450&odnHeight=450&odnBg=ffffff",
    price: 12.99,
    max_quantity: 3,
  },
  {
    id: 2,
    name: "Toilet roll",
    img: "https://images.allianceonline.co.uk/Products/HBTR0010.jpg",
    price: 7.99,
    max_quantity: 4,
  },
  {
    id: 3,
    name: "Pasta",
    img:
      "https://www.italianfoodexperts.com/wp-content/uploads/2017/11/Vera-pasta-italiana.jpg",
    price: 4.99,
    max_quantity: 5,
  },
  {
    id: 4,
    name: "Eggs",
    img:
      "https://i0.wp.com/images-prod.healthline.com/hlcmsresource/images/AN_images/why-are-eggs-good-for-you-1296x728-feature.jpg?w=1155&h=1528",
    price: 5.99,
    max_quantity: 2,
  },
];

localStorage.products = JSON.stringify(products)
const productsContainer = document.querySelector("#products");

const product_list = JSON.parse(localStorage.products);

const createProduct = () => {
  product_list.forEach((product) => {
    const product_div = `<img src=${product.img} />
                            <h3>${product.name}</h3>
                            <p>${product.price}</p> `;

    const div = document.createElement("div");
    const select = document.createElement("select");
    select.id = 'select_' + product.id
    select.setAttribute('onchange',`selectQuantity(${product.id})`)

    for (let quantity = 0; quantity < product.max_quantity; quantity++) {
      const option = document.createElement("option");
      option.value = quantity;
      option.innerText = quantity;
      select.append(option);
    }

    div.innerHTML = product_div;
    div.append(select);

    productsContainer.append(div);
  });
};


let totalAmount = {};
let click = 0;

const selectQuantity = (id) => {
    const select = document.querySelector(`#select_${id}`)
    const quantity = select.value
    let price = product_list[id - 1].price

    let each_total = calculateAmount(price ,quantity)
    totalAmount[`${id}`] = each_total
    
    console.log(totalAmount)
    total_spent()
   
}


const remaining_balance = 50

const calculateAmount = (price , quantity) => {
    let each_total = price * quantity
    return each_total   
}


const total_spent = () => {
    let sum = 0
    for(let key in totalAmount) { 
        sum += totalAmount[key]
    }

    displayBalance(sum)
}


const displayBalance = (sum) => {
    let balance = remaining_balance - sum

    const span = document.querySelector('#remaining span')
    const error_div = document.createElement('div')

    if(sum > remaining_balance) {
        const main_div = document.querySelector('#cart')
        
        error_div.className = 'error'
        error_div.innerText = 'Not enough money left for that!'
        const is_error_exist = document.querySelector('.error')

        if(!is_error_exist) {
            main_div.append(error_div)
        }

    }else if(sum < remaining_balance) {
        const is_error_exist = document.querySelector('.error')
        if(is_error_exist) {
            is_error_exist.remove()
        }
        
    }
    span.innerText = balance.toFixed(2)
}

createProduct();

const {
  fireEvent,
} = require("@testing-library/dom/dist/@testing-library/dom.umd.js");

const wait = (time) => new Promise((resolve) => setTimeout(resolve, time));

const productDivs = document.querySelectorAll("#products > div");
const remainingBudgetSpan = document.querySelector("#remaining > span");

describe("1. Products rendered", () => {
  test("4 products rendered", () => {
    expect(productDivs.length).toBe(products.length);
  });

  test("each product div contains an img tag", () => {
    productDivs.forEach((productDiv) => {
      expect(Boolean(productDiv.querySelector("img"))).toBe(true);
    });
  });

  test("each product div contains an h3 tag", () => {
    productDivs.forEach((productDiv) => {
      expect(Boolean(productDiv.querySelector("h3"))).toBe(true);
    });
  });

  test("each product div contains an p tag", () => {
    productDivs.forEach((productDiv) => {
      expect(Boolean(productDiv.querySelector("p"))).toBe(true);
    });
  });

  test("each product div contains a select tag", () => {
    productDivs.forEach((productDiv) => {
      expect(Boolean(productDiv.querySelector("select"))).toBe(true);
    });
  });

  test("each product div contains elements in the correct order", () => {
    productDivs.forEach((productDiv) => {
      expect([...productDiv.children].map((el) => el.tagName)).toEqual([
        "IMG",
        "H3",
        "P",
        "SELECT",
      ]);
    });
  });
});

describe("2. Dropdowns to select quantity", () => {
  test("each product dropdown contains the correct options", () => {
    products.forEach((product, i) => {
      const options = productDivs[i].querySelectorAll("option");
      const optionValues = [...options].map((option) => option.innerText);
      const expectedOptionValues = [];
      for (let index = 0; index <= product.max_quantity; index++) {
        expectedOptionValues.push(index.toString());
      }

      expect(optionValues).toEqual(expectedOptionValues);
    });
  });
});

describe("3. Budget updates", () => {
  const firstDiv = productDivs[0];
  const firstProduct = products[0];

  test("selecting some of any product updates the budget displayed", async () => {
    fireEvent.input(firstDiv.querySelector("select"), {
      target: { value: "1" },
    });

    expect(remainingBudgetSpan.innerHTML).toBe(
      `£${budget - firstProduct.price}`
    );
  });
});

describe("4. Budget limit", () => {
  const [firstDiv, secondDiv] = productDivs;
  const [firstProduct] = products;

  beforeAll(() => {
    productDivs.forEach(productDiv => {
      fireEvent.input(productDiv.querySelector("select"), {
        target: { value: "0" },
      });
    })
  })

  test("selecting products over budget doesn't allow selection", async () => {
    fireEvent.input(firstDiv.querySelector("select"), {
      target: { value: "3" },
    });
    fireEvent.input(secondDiv.querySelector("select"), {
      target: { value: "4" },
    });

    expect(remainingBudgetSpan.innerHTML).toBe(
      `£${(budget - firstProduct.price * 3).toFixed(2)}`
    );
  });

  test("selecting products over budget displays error message for 3 seconds", async () => {
    fireEvent.input(firstDiv.querySelector("select"), {
      target: { value: "3" },
    });
    fireEvent.input(secondDiv.querySelector("select"), {
      target: { value: "4" },
    });

    expect(Boolean(document.querySelector(".error"))).toBe(true);

    await wait(2500);

    expect(Boolean(document.querySelector(".error"))).toBe(true);
    
    await wait(1000);

    expect(Boolean(document.querySelector(".error"))).toBe(false);
  });
});
