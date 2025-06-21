package com.app.caffee.dao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.app.caffee.POJO.Category;

public interface CategoryDao extends JpaRepository<Category, Integer> {
    List<Category> getAllCategory();
}
