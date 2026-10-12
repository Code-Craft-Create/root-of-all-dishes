# Cuisine stages: draft plan (2026-10-10)

On paper only, no code changes yet. 3 stages with 4 cuisines each. Every dish below already exists in js/data/dishes.js. The player picks which cuisine of the current stage to open, and the next stage opens once all 4 are done.

## Overview

| Stage | Cuisine | Dishes |
|---|---|---|
| Stage 1 | British & Irish | 22 |
| Stage 1 | German, Austrian & Swiss | 22 |
| Stage 1 | Nordic & Eastern European | 21 |
| Stage 1 | North American | 22 |
| Stage 2 | French | 25 |
| Stage 2 | Italian | 25 |
| Stage 2 | Mediterranean & Middle Eastern | 25 |
| Stage 2 | Southeast Asian | 21 |
| Stage 3 | Indian & South Asian | 31 |
| Stage 3 | Chinese & Korean | 29 |
| Stage 3 | Japanese | 26 |
| Stage 3 | Latin American & Caribbean | 31 |

| Stage | Range | Spread (max/min) | Average |
|---|---|---|---|
| Stage 1 | 21–22 | +5% | 21.8 |
| Stage 2 | 21–25 | +19% | 24.0 |
| Stage 3 | 26–31 | +19% | 29.3 |

That assigns 300 of the 450 dishes. The other 150 go into a free pool (see the end).

## Stage 1

Temperate farm food: grain, potatoes, dairy, meat, orchard fruit. Short chains to learn the game.

### British & Irish (22)

Full English Breakfast, Fish and Chips, Cottage Pie, Beef Wellington, Roast Chicken, Roast Beef & Yorkshire Pudding, Scones with Jam & Cream, Apple Pie, Sticky Toffee Pudding, Victoria Sponge, Trifle, Cornish Pasty, Bangers and Mash, Welsh Rarebit, Irish Stew, Scotch Broth, Cullen Skink, Lamb Chops with Mint Sauce, Rhubarb Crumble, Apple & Blackberry Crumble, Porridge, Cup of Tea

### German, Austrian & Swiss (22)

Wiener Schnitzel, Bratwurst with Sauerkraut, Käsespätzle, Black Forest Cake, Apple Strudel, Sachertorte, Soft Pretzels, Cheese Fondue, Rösti, Raclette, Zürcher Geschnetzeltes, Älplermagronen, Bündner Gerstensuppe, Engadiner Nusstorte, Linzer Torte, Roast Goose with Red Cabbage, Mohnkuchen, Styrian Pumpkin Soup, Christmas Stollen, Kaiserschmarrn, Tafelspitz, Bircher Muesli

### Nordic & Eastern European (21)

Swedish Meatballs, Gravlax, Kanelbullar, Smørrebrød, Karelian Pies, Norwegian Fish Soup, Pickled Herring on Rye, Æbleskiver, Pierogi, Borscht, Beef Stroganoff, Chicken Kiev, Blini with Salmon Roe, Gołąbki, Pelmeni, Syrniki, Olivier Salad, Bigos, Hungarian Goulash, Chicken Paprikash, Lángos

### North American (22)

Cheeseburger, Hot Dog, Mac and Cheese, BBQ Pulled Pork, Buffalo Wings, New England Clam Chowder, Southern Fried Chicken, Cornbread, Pumpkin Pie, Pecan Pie, New York Cheesecake, Maple Pecan Pancakes, Lobster Roll, Caesar Salad, Cobb Salad, Poutine, Roast Turkey with Cranberry, Reuben Sandwich, Peanut Butter & Jelly, Eggs Benedict, BLT Sandwich, Strawberry Milkshake

## Stage 2

Olive oil, wine, citrus, durum wheat, seafood, and a first taste of the tropics (rice, coconut, fish sauce).

### French (25)

Croissants, Pain au Chocolat, Quiche Lorraine, French Onion Soup, Ratatouille, Coq au Vin, Boeuf Bourguignon, Bouillabaisse, Crème Brûlée, Tarte Tatin, Crêpes Suzette, Duck Confit, Cassoulet, Salade Niçoise, Steak Frites, Moules Marinières, Cheese Soufflé, Profiteroles, Éclairs, Macarons, Gratin Dauphinois, Croque Monsieur, Galette Complète, Tarte Flambée, Sole Meunière

### Italian (25)

Pizza Margherita, Pizza Quattro Formaggi, Pizza Prosciutto e Funghi, Spaghetti Carbonara, Tagliatelle al Ragù, Lasagna alla Bolognese, Spaghetti Aglio e Olio, Cacio e Pepe, Trofie al Pesto, Risotto alla Milanese, Porcini Risotto, Osso Buco, Gnocchi al Pomodoro, Caprese Salad, Bruschetta, Minestrone, Tiramisu, Panna Cotta, Cannoli, Saltimbocca alla Romana, Arancini, Focaccia, Eggplant Parmigiana, Spinach & Ricotta Ravioli, Espresso

### Mediterranean & Middle Eastern (25)

Paella Valenciana, Seafood Paella, Gazpacho, Tortilla Española, Patatas Bravas, Gambas al Ajillo, Churros con Chocolate, Bacalhau à Brás, Pastel de Nata, Pulpo a la Gallega, Greek Salad, Moussaka, Spanakopita, Souvlaki with Tzatziki, Baklava, Hummus, Falafel, Tabbouleh, Shakshuka, Lamb Tagine with Apricots, Vegetable Couscous, Chicken Shawarma, Kofta Kebab, Persian Jeweled Rice, Moroccan Mint Tea

### Southeast Asian (21)

Pad Thai, Thai Green Curry, Thai Red Curry with Shrimp, Massaman Curry, Tom Yum Goong, Tom Kha Gai, Som Tam, Mango Sticky Rice, Phở Bò, Bánh Mì, Gỏi Cuốn, Chicken Satay, Nasi Goreng, Beef Rendang, Laksa, Chicken Adobo, Hainanese Chicken Rice, Lumpia, Sinigang, Taro Coconut Dessert, Cashew Chicken

## Stage 3

The longest chains: spice blends, soy, miso and fermentation, nixtamalized corn, cacao, tropical fruit.

### Indian & South Asian (31)

Butter Chicken, Chicken Tikka Masala, Palak Paneer, Dal Tadka, Chana Masala, Chicken Biryani, Samosas, Garlic Naan, Aloo Gobi, Lamb Rogan Josh, Pork Vindaloo, Masala Dosa, Mango Lassi, Gulab Jamun, Kheer, Onion Pakora, Goan Fish Curry, Masala Chai, Saag Aloo, Paneer Tikka, Tandoori Chicken, Chole Bhature, Rajma Chawal, Pav Bhaji, Idli with Sambar, Malai Kofta, Momos, Machher Jhol, Appam with Vegetable Stew, Jalebi, Nihari

### Chinese & Korean (29)

Egg Fried Rice, Kung Pao Chicken, Mapo Tofu, Sweet and Sour Pork, Peking Duck, Jiaozi, Wonton Soup, Char Siu, Hot and Sour Soup, Chicken Chow Mein, Spring Rolls, Congee, Dan Dan Noodles, Mooncakes, Egg Tarts, Steamed Fish with Ginger, Beef with Broccoli, Xiaolongbao, Twice-Cooked Pork, Garlic Snow Peas, Pot of Green Tea, Bibimbap, Kimchi Jjigae, Bulgogi, Korean Fried Chicken, Tteokbokki, Japchae, Kimchi Fried Rice, Haemul Pajeon

### Japanese (26)

Nigiri Sushi, Tuna Maki, California Roll, Sashimi Platter, Miso Soup, Tonkotsu Ramen, Shoyu Ramen, Tempura, Teriyaki Salmon, Chicken Katsu Curry, Tonkatsu, Okonomiyaki, Takoyaki, Gyoza, Onigiri, Daifuku Mochi, Matcha Latte, Kake Udon, Zaru Soba, Yakitori, Oyakodon, Gyudon, Unadon, Uni Don, Natto Gohan, Shabu-shabu

### Latin American & Caribbean (31)

Tacos al Pastor, Guacamole, Chicken Enchiladas, Beef Burrito, Quesadillas, Mole Poblano, Chiles Rellenos, Tamales, Pozole Rojo, Ceviche, Tres Leches Cake, Elote, Chilaquiles, Fish Tacos, Feijoada, Pão de Queijo, Brigadeiros, Moqueca, Empanadas, Asado with Chimichurri, Alfajores, Churrasco, Arepas Reina Pepiada, Lomo Saltado, Causa Limeña, Fried Plantains, Jerk Chicken, Rice and Peas, Ackee and Saltfish, Doubles, Piña Colada

## What changed from today's cuisines

- **Everyday Basics, Drinks, Seasonal & Regional Classics and Around the World disappear as cuisines.** Their dishes either move to the region they come from (Bircher Muesli to the Swiss group, Cup of Tea to the British, Espresso to Italian, Shabu-shabu to Japanese, Cashew Chicken, Lumpia and Sinigang to Southeast Asian, Nihari to Indian, Fish Tacos, Moqueca and Causa to Latin American, the Caribbean dishes to Latin American & Caribbean) or go into the free pool.
- **Central & Northern European is split.** German, Austrian and Swiss dishes form their own cuisine, and Scandinavia joins Eastern Europe.
- **Spanish & Portuguese and Greek & Middle Eastern merge** into Mediterranean & Middle Eastern, with the Moroccan tagine, couscous and mint tea.
- **Chinese and Korean are combined.** Korean alone has only 8 dishes. Japanese stays separate.
- **Mexican & Latin American takes in the Caribbean.**

## Free pool (150 dishes, not tied to a cuisine)

These stay in the game and can be discovered and cooked once you can make their ingredients, whatever stage you're in. That gives a free starter set before the first pick (Garden Salad, Boiled Eggs and the other Everyday Basics) and extra dishes to find along the way. By current cuisine:

- Everyday Basics (19): Buttered Toast, Boiled Eggs, Garden Salad, Baked Potato, Scrambled Eggs, Omelette, Fruit Salad, Mashed Potatoes, Corn on the Cob, Grilled Cheese Sandwich, Ham & Cheese Sandwich, Pancakes, French Toast, Waffles, Crêpes, Vegetable Soup, Roasted Vegetables, Smoothie, Avocado Toast
- British & Irish (4): Club Sandwich, Shepherd's Pie, Kedgeree, Smoked Salmon Bagel
- French (8): Duck à l'Orange, Madeleines, Mille-feuille, Tarte au Citron, Chocolate Mousse, Steak Tartare, Truffle Omelette, Oysters Mignonette
- Italian (11): Pizza Marinara, Pepperoni Pizza, Penne all'Arrabbiata, Fettuccine Alfredo, Polenta e Funghi, Affogato, Spaghetti alle Vongole, Beef Carpaccio, Prosciutto e Melone, Panforte, Vitello Tonnato
- Spanish & Portuguese (5): Pan con Tomate, Crema Catalana, Fabada Asturiana, Calamares Fritos, Jamón & Manchego Board
- Greek & Middle Eastern (8): Baba Ganoush, Lahmacun, Mujaddara, Turkish Delight, Ful Medames, Fattoush, Manakish Za'atar, Halloumi Salad
- Mexican & Latin American (1): Nachos
- North American (9): Gumbo, Jambalaya, Brownies, Chocolate Chip Cookies, Key Lime Pie, Banana Bread, Banana Split, S'mores, Pastrami on Rye
- Central & Northern European (1): Rabbit Stew
- African (9): Jollof Rice, Doro Wat, Bobotie, Maafe, Kelewele, Fufu with Light Soup, Shakshouka Tunisienne, Misir Wot, Chakalaka
- Drinks (8): Cappuccino, Hot Chocolate, Lemonade, Sangria, Mulled Wine, Mojito, Elderflower Cordial, Iced Coffee
- Seasonal & Regional Classics (53): Asparagus with Hollandaise, Kale & Quinoa Salad, Brussels Sprouts with Bacon, Butternut Squash Soup, Stuffed Artichokes, Chili con Carne, Hoppin' John, Steak Béarnaise, Steak au Poivre, Peach Melba, Pavlova, Citrus Salad, Persimmon & Burrata Salad, Lychee Sorbet, White Chocolate Macadamia Cookies, Chanterelles on Toast, Chicken with Morel Cream, Wild Garlic Spaghetti, Quail Egg Canapés, Halibut with Beurre Blanc, Czech Christmas Carp, Spelt Waffles, Tempeh Buddha Bowl, Chickpea Coconut Curry, Bloody Mary, Fesenjan, Overnight Oats, Oat Milk Latte, Okroshka, Stamppot, Gouda & Apple Sandwich, Baked Brie en Croûte, Roast Leg of Lamb, Antipasto Platter, Trout Amandine, Maryland Crab Cakes, Sardines on Toast, Potted Shrimp, Deviled Eggs, Hazelnut Crêpes, Penne alla Vodka, Thumbprint Cookies, Marmalade Toast, Far Breton, Mont Blanc, Paris-Brest, Yam Pottage, Celeriac Rémoulade, Watercress Soup, Capuns, Anisbrötli, Nougat Montélimar, Lovage Potato Soup
- Around the World (14): Ćevapi, Khachapuri, Plov, Jansson's Temptation, Aussie Meat Pie, Lamingtons, Anzac Biscuits, Grilled Barramundi, Hokey Pokey Ice Cream, Poke Bowl, Suya, Menemen, Sabich, Butter Tarts

## Open points

- **African cuisine is left out.** It has only 9 dishes (11 with Suya and Yam Pottage), too few to sit within 20% of any stage. Options: keep it in the pool as now; or add about 10 new African dishes later and swap it in for Southeast Asian in Stage 2.
- **Southeast Asian is the tightest fit.** It has 21 dishes, which is why the other Stage 2 cuisines are capped at 25 (25 / 21 = +19%).
- **The unlock goal per cuisine.** A suggestion is to cook about 60% of a cuisine's dishes before it counts as done: around 13 in Stage 1, 15 in Stage 2 and 18 in Stage 3.
- **Pack money.** Cuisines would open by choice instead of by buying them in the Shop. The Shop could still sell a "skip ahead" option or the pool dishes.
