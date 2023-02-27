exports.mapData = (data) => {
    return {
        id : data.id,
        name : data.name,
        email : data.email,
        createdAt : data.createdAt,
        updatedAt : data.updatedAt  
    }
}