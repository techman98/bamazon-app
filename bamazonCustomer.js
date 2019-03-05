var mysql = require("mysql");
var inquirer = require("inquirer");

// create the connection information for the sql database
var connection = mysql.createConnection({
    host: "localhost",

    port: 3306,

    user: "root",

    password: "21Skillet!",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    connection.query("SELECT * FROM products", function (err, results) {
        if (err) throw err;
        for (i = 0; i < results.length; i++) {
            const res = results[i];
            console.log("Product ID: " + res.item_id + "\n", "Name: " + res.product_name + "\n", "Price: $" + res.price + "\n", "Quantity: " + res.stock_quantity);
            console.log("-------------------------------------------------")
        }
        selectItem();

    });
});

function selectItem() {
    inquirer
        .prompt({
            name: "itemToBuy",
            type: "input",
            message: "Enter the Product ID of the item you want to purchase.",
        }).then(function (answer) {
            connection.query("SELECT * FROM products WHERE item_id = ?", [answer.itemToBuy], function (err, results) {
                if (err) throw err;
                if (results.length === 0) {
                    console.log('Invalid product ID. Pease select a valid product ID.')
                    selectItem();
                } else {
                    console.log("Product ID entered was " + answer.itemToBuy);
                    var item = answer.itemToBuy;
                    howMuch(item);
                }

            })
        });
}

function howMuch(item) {
    inquirer
        .prompt({
            name: "howMany",
            type: "input",
            message: "How many would you like to purchase?",
        })
        .then(function (answer) {
            connection.query("SELECT ? FROM products WHERE item_id = ?", [answer.howMany, item], function (err, results) {
                if (err) throw err;
                else {
                    var howMany = answer.howMany;
                    stockQuantity(howMany, item);
                }
            });
        });
}

var updateDb = function (stock_available, item_price, item_name, howMany, item) {
    connection.query(
        "UPDATE products SET stock_quantity = ? WHERE item_id = ?", [parseInt(stock_available - howMany), parseInt(item)],
        function (err, result) {
            if (err) {
                throw err;
            } else {
                console.log("You have bought " + howMany + " " + item_name + " for $" + item_price * howMany);
            }
        });
    connection.end();
}

var stockQuantity = function (howMany, item) {
    connection.query(
        "SELECT stock_quantity, price, product_name FROM products WHERE ?", [item_id = item],
        function (err, result) {
            if (err) {
                throw err;
            }
            var stock_available = result[item - 1].stock_quantity;
            var item_price = result[item - 1].price;
            var item_name = result[item - 1].product_name;

            //checks to see if there is enough quantity to satisfy customer's purchase
            if (howMany > stock_available) {
                console.log("Sorry there is not enough quantity to satisfy your order.");
                howMuch();
            } else {
                console.log("Purchasing " + howMany + " items...");
                //if there is enough quantity then calling function to complete purchase
                updateDb(stock_available, item_price, item_name, howMany, item);
            }
        }
    )
};