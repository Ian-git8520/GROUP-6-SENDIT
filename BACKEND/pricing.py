def calculate_price(distance, weight, size, price_index):
    distance_cost = distance * price_index.price_per_km
    weight_cost = weight * price_index.price_per_kg
    size_cost = size * price_index.price_per_cm

    return distance_cost + weight_cost + size_cost

