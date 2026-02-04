def calculate_price(distance, weight, size):
    base = 300
    distance_cost = distance * 50
    weight_cost = weight * 10
    size_cost = size * 2
    return base + distance_cost + weight_cost + size_cost
