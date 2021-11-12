const Sauce = require('../models/sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
    const url = req.protocol + '://' + req.get('host');
    req.body.sauce = JSON.parse(req.body.sauce);
    const sauce = new Sauce({
        userId: req.body.sauce.userId,       
        name: req.body.sauce.name,
        manufacturer: req.body.sauce.manufacturer,
        description: req.body.sauce.description,
        mainPepper: req.body.sauce.mainPepper,
        imageUrl: url + '/images/' + req.file.filename,
        heat: req.body.sauce.heat,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: [],
    });
    sauce.save().then(
        () => {
            res.status(201).json({
                message: 'Post saved successfully'
            })
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
        } 
    ); 
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({
        _id: req.params.id
    }).then(
        (sauce) => {
            res.status(200).json(sauce);
        } 
    ).catch(
        (error) => {
            res.status(404).json({
                error: error
            });
        }
    ); 
};

exports.modifySauce = (req, res, next) => {
    let sauce = new Sauce({ _id: req.params._id });
    if (req.file) {
        const url = req.protocol + '://' + req.get('host');
        req.body.sauce = JSON.parse(req.body.sauce);
        sauce = {
            _id: req.params.id,
            userId: req.body.sauce.userId,
            name: req.body.sauce.name,
            manufacturer: req.body.sauce.manufacturer,
            description: req.body.sauce.description,
            mainPepper: req.body.sauce.mainPepper,
            imageUrl: url + '/images/' + req.file.filename,
            heat: req.body.sauce.heat,
            likes: 0,
            dislikes: 0,
            usersLiked: [],
            usersDisliked: [],
        };
    } else {
        sauce = {
            _id: req.params.id,
            userId: req.body.userId,
            name: req.body.name,
            manufacturer: req.body.manufacturer,
            description: req.body.description,
            mainPepper: req.body.mainPepper,
            imageUrl: req.body.imageUrl,
            heat: req.body.heat,
            likes: 0,
            dislikes: 0,
            usersLiked: [],
            usersDisliked: [],
        };
    }

    Sauce.updateOne({_id: req.params.id}, sauce).then(
        () => {
            res.status(201).json({
                message: 'Sauce updated successfully!'
            });
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
        }
    );
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id}).then(
        (sauce) => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink('images/' + filename, () => {
                Sauce.deleteOne({_id: req.params.id}).then(
                    () => {
                        res.status(200).json({
                            message: 'Deleted!'
                        });
                    }
                ).catch(
                    (error) => {
                        res.status(400).json({
                            error: error
                        });
                    }
                );
            });
        }
    );
};

exports.getAllSauces = (req, res, next) => {
    Sauce.find().then(
        (sauces) => {
            res.status(200).json(sauces);
        } 
    ).catch(
        (error) => {
            res.status(400).json({
                error: error   
            });
        }
    );
};

exports.likeDislike = (req, res, next) => {
    const like = req.body.like;
    const userId = req.body.userId;
    const sauceId = req.params.id;
    const data = {
        _id: sauceId
    }

    let message = ""

    if (like !== 0) {
        if (like === 1) {
            data.$push = {
                usersLiked: userId //push userId in the usersLiked array.
            }
            data.$inc = {//increments
                likes: +1 //add 1 to likes
            }

            message = "You have liked this sauce"

        } else if (like === -1) { //if like = -1
            data.$push = {
                usersDisliked: userId //push userId in the usersLiked array.
            }
            data.$inc = {//increments
                dislikes: +1 //add 1 to dislikes
            }

            message = "You have disliked this sauce"
        }
        
        updateSauce(data)
    } else {// if like = 0
        Sauce.findOne({
            _id: sauceId
        })
            .then((sauce) => {

                if (sauce.usersLiked.includes(userId)) {
                    data.$pull = {
                        usersLiked: userId //remove userId from the usersLiked array.
                    }
                    data.$inc = {
                        likes: -1 //minus 1 from likes
                    }

                    message = "You have withdrawn your like"
                
                } else {
                    data.$pull = {
                        usersDisliked: userId //pull userId from the usersDisliked array.
                    }
                    data.$inc = {
                        dislikes: -1 //minus 1 from dislikes
                    }

                    message = "You have withdrawn your dislike"
                    
                }

                updateSauce(data)
            })
            .catch((error) =>
                res.status(404).json({
                    error
                })
            );
    }

    function updateSauce (data) {
        Sauce.updateOne(data)
            .then(() =>
                res.status(200).json({ message })
            )
            .catch((error) =>
                res.status(400).json({ error })
            );
    }
};
